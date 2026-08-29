/**
 * The operation registry.
 *
 * Each entry knows how to (a) apply itself to a material, (b) label itself for
 * a Timeline chip, and (c) predict its result so a panel can say "-> 72 atoms"
 * before the user commits. The crystallography is entirely made.js; this file
 * only wraps it so every transform becomes a recordable, replayable step.
 *
 * The logic is ported from v1's src/reducers/Material.ts, which did the same
 * work imperatively against a mutable session state.
 */
import type { Matrix3X3Schema } from "@mat3ra/esse/dist/js/types";
import { Made } from "@mat3ra/made";
import Material from "@mat3ra/made/dist/js/Material";
import type { SlabConfigSchema } from "@mat3ra/made/dist/js/tools/surface";

import type { Engine, ResultDigest } from "./types";

export interface OperationDefinition<P = any> {
    type: string;
    engine: Engine;
    /** Shown on the chip and in the Catalog. */
    title: string;
    /** True when the operation starts a material rather than transforming one. */
    isOrigin?: boolean;
    apply: (material: Material, params: P) => Material;
    /** One-line parameter summary for the chip. */
    digest?: (params: P) => string;
    /**
     * Cheap forecast for the panel's predicted-result line. Defaults to
     * running `apply` and measuring — correct by construction, and fast enough
     * for native ops; overridden where a closed form avoids building atoms.
     */
    predict?: (material: Material, params: P) => Partial<ResultDigest>;
}

/** Number of sites, read from the basis schema (tolerant of shape drift). */
export function atomCountOf(material: Material): number {
    const elements = (material.basis as { elements?: unknown[] } | undefined)?.elements;
    return Array.isArray(elements) ? elements.length : 0;
}

/** Measure a material. Kept tolerant: a malformed structure must not crash a chip. */
export function digestOf(material: Material): ResultDigest {
    try {
        return {
            formula: material.formula ?? "—",
            atomCount: atomCountOf(material),
            latticeType: material.lattice?.type,
            a: material.lattice?.a,
            b: material.lattice?.b,
            c: material.lattice?.c,
        };
    } catch (e) {
        return { formula: "—", atomCount: 0 };
    }
}

/** Materials are immutable between operations: always transform a copy. */
function copyOf(material: Material): Material {
    return new Material(material.toJSON());
}

function determinant(m: Matrix3X3Schema): number {
    return (
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
}

export interface SurfaceParams {
    h: number;
    k: number;
    l: number;
    thickness: number;
    vacuumRatio: number;
    vx: number;
    vy: number;
}

const definitions: OperationDefinition[] = [
    // ---------------------------------------------------------------- origins
    {
        type: "create-default",
        engine: "native",
        title: "Created",
        isOrigin: true,
        apply: () => Material.createDefault() as unknown as Material,
        digest: () => "default silicon",
    },
    {
        type: "create-from-config",
        engine: "native",
        title: "Created",
        isOrigin: true,
        // Standard-library entries and set children both land here: the config
        // is the origin, so replay never depends on an external catalog.
        apply: (_m, p: { config: any; source?: string }) => new Material(p.config),
        digest: (p: { source?: string }) => p.source || "from config",
    },
    {
        type: "import-file",
        engine: "native",
        title: "Imported",
        isOrigin: true,
        apply: (_m, p: { content: string; format: string; name: string }) => {
            const config = Made.parsers.nativeFormatParsers.convertFromNativeFormat(p.content);
            return new Material({ ...(config as any), name: p.name });
        },
        digest: (p: { name: string; format: string }) => `${p.name} (${p.format})`,
    },

    // ------------------------------------------------------------- transforms
    {
        type: "rename",
        engine: "native",
        title: "Renamed",
        apply: (m, p: { name: string }) => {
            const next = copyOf(m);
            next.name = p.name;
            return next;
        },
        digest: (p: { name: string }) => `"${p.name}"`,
    },
    {
        type: "supercell",
        engine: "native",
        title: "Supercell",
        apply: (m, p: { matrix: Matrix3X3Schema }) =>
            new Material(Made.tools.supercell.generateConfig(m, p.matrix) as any),
        digest: (p: { matrix: Matrix3X3Schema }) =>
            `${p.matrix[0][0]}×${p.matrix[1][1]}×${p.matrix[2][2]}`,
        // Closed form: |det| scales the atom count, so a 20x20x20 request can be
        // forecast (and refused) without ever building the atoms.
        predict: (m, p: { matrix: Matrix3X3Schema }) => ({
            atomCount: Math.round(atomCountOf(m) * Math.abs(determinant(p.matrix))),
        }),
    },
    {
        type: "surface",
        engine: "native",
        title: "Slab / Surface",
        apply: (m, p: SurfaceParams) => {
            const config = Made.tools.surface.generateConfig(
                m,
                [p.h, p.k, p.l],
                p.thickness,
                p.vx,
                p.vy,
            ) as SlabConfigSchema;
            const { outOfPlaneAxisIndex } = config;
            // v1 stashed slab facts in metadata because lineage had nowhere to
            // live. Kept for parity with downstream consumers; the operation log
            // is now the authoritative record.
            Object.assign(config, {
                metadata: {
                    isSlab: true,
                    h: p.h,
                    k: p.k,
                    l: p.l,
                    thickness: p.thickness,
                    vacuumRatio: p.vacuumRatio,
                    vx: p.vx,
                    vy: p.vy,
                    outOfPlaneAxisIndex,
                },
            });
            const next = new Material(config as any);
            Made.tools.material.scaleOneLatticeVector(
                next,
                (["a", "b", "c"][outOfPlaneAxisIndex] || "c") as "a" | "b" | "c",
                1 / (1 - p.vacuumRatio),
            );
            return next;
        },
        digest: (p: SurfaceParams) => `(${p.h}${p.k}${p.l}) · ${p.thickness} layers`,
    },
    {
        type: "boundary-conditions",
        engine: "native",
        title: "Boundary conditions",
        apply: (m, p: { type: string; offset: number }) => {
            const next = copyOf(m);
            next.metadata = {
                ...next.metadata,
                boundaryConditions: { type: p.type, offset: p.offset },
            } as any;
            return next;
        },
        digest: (p: { type: string; offset: number }) => `${p.type} · offset ${p.offset} Å`,
    },
    {
        type: "conventional-cell",
        engine: "native",
        title: "Conventional cell",
        apply: (m) => new Material((m as any).getACopyWithConventionalCell().toJSON()),
        digest: () => "primitive → conventional",
    },
    {
        type: "toggle-periodicity",
        engine: "native",
        title: "Periodicity",
        apply: (m, p: { isNonPeriodic: boolean }) => {
            const next = copyOf(m);
            next.isNonPeriodic = p.isNonPeriodic;
            if (p.isNonPeriodic) {
                Made.tools.material.scaleLatticeToMakeNonPeriodic(next);
                Made.tools.material.translateAtomsToCenter(next);
            }
            return next;
        },
        digest: (p: { isNonPeriodic: boolean }) =>
            p.isNonPeriodic ? "→ non-periodic" : "→ periodic 3D",
    },
    {
        type: "set-basis",
        engine: "native",
        title: "Edited basis",
        apply: (m, p: { xyz: string; units?: "crystal" | "cartesian" }) => {
            const next = copyOf(m);
            next.setBasis(p.xyz, "xyz", p.units);
            return next;
        },
        digest: (p: { xyz: string }) => `${p.xyz.trim().split("\n").length} sites`,
    },
    {
        type: "set-lattice",
        engine: "native",
        title: "Edited lattice",
        apply: (m, p: { lattice: any; preserveBasis: boolean }) => {
            // Ported verbatim from v1's handleUpdateLattice: converting to
            // cartesian first is what "preserve interatomic distances" means.
            const previous = copyOf(m);
            if (p.preserveBasis) previous.toCartesian();
            else previous.toCrystal();
            const next = new Material({ ...(previous.toJSON() as any), lattice: p.lattice });
            next.toCrystal();
            return next;
        },
        digest: (p: { lattice: any }) =>
            `${p.lattice?.type ?? "?"} · a=${Number(p.lattice?.a ?? 0).toFixed(3)}`,
    },
    {
        type: "manual-patch",
        engine: "manual",
        title: "Manual edit",
        // The 3D canvas hands back a whole material; only the basis can differ,
        // so that is all the step stores. Compact, and replayable in order.
        apply: (m, p: { basis: any; note?: string }) => {
            const next = new Material({ ...(m.toJSON() as any), basis: p.basis });
            return next;
        },
        digest: (p: { note?: string }) => p.note || "edited in 3D",
    },

    // -------------------------------------------------- set-producing markers
    // These record that a batch was generated from this material. The children
    // are real materials with their own logs; the chip is the provenance link.
    {
        type: "combinatorial-set",
        engine: "native",
        title: "Combinatorial set",
        apply: (m) => m,
        digest: (p: { count: number }) => `→ ${p.count} materials`,
    },
    {
        type: "interpolated-set",
        engine: "native",
        title: "Interpolated set (NEB)",
        apply: (m) => m,
        digest: (p: { count: number }) => `→ ${p.count} images`,
    },
];

export const REGISTRY: Record<string, OperationDefinition> = Object.fromEntries(
    definitions.map((d) => [d.type, d]),
);

export function getDefinition(type: string): OperationDefinition {
    const def = REGISTRY[type];
    if (!def) throw new Error(`Unknown operation type: ${type}`);
    return def;
}

/** Forecast an operation's result without committing it. */
export function predict(
    material: Material,
    type: string,
    params: unknown,
): Partial<ResultDigest> & { error?: string } {
    const def = getDefinition(type);
    try {
        if (def.predict) return def.predict(material, params);
        return digestOf(def.apply(material, params));
    } catch (e) {
        return { error: e instanceof Error ? e.message : String(e) };
    }
}
