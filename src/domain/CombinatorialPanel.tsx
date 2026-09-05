/**
 * Combinatorial set — one template, many materials.
 *
 * The same XYZ-with-combinations syntax v1 used. Where v1 dumped the results
 * into a flat list, the batch here becomes a set: children of the source
 * material, added and undone as a single step.
 */
import { Made } from "@mat3ra/made";
import type Material from "@mat3ra/made/dist/js/Material";
import React, { useMemo, useState } from "react";

export interface CombinatorialPanelProps {
    material: Material;
    /** Receives one config per emitted material. */
    onApply: (configs: { config: unknown; label: string }[], xyz: string) => void;
    onCancel: () => void;
}

const MAX_MATERIALS = 100;

export function CombinatorialPanel({ material, onApply, onCancel }: CombinatorialPanelProps) {
    const [xyz, setXyz] = useState(() => material.getBasisAsXyz());

    // Forecast the batch on every keystroke, exactly like the numeric panels:
    // a combinatorial run is the easiest way to accidentally make 500 materials.
    //
    // CombinatorialBasis emits bare element/coordinate arrays with no lattice,
    // so each one is rebuilt into a full material config the same way v1's
    // dialog did — via Basis.fromElementsAndCoordinates against this material's
    // own cell and units.
    const forecast = useMemo(() => {
        try {
            const bases = new Made.parsers.xyz.CombinatorialBasis(xyz).allBasisConfigs;
            const lattice = new Made.Lattice(material.lattice as never);
            const source = material.toJSON() as unknown as Record<string, unknown> & {
                _id?: unknown;
            };
            const configs = bases.map((entry) => {
                const basis = Made.Basis.fromElementsAndCoordinates({
                    elements: entry.elements,
                    coordinates: entry.coordinates,
                    cell: lattice.vectorArrays,
                    units: material.basis.units,
                    labels: material.getBasis().labels,
                } as never);
                const { _id: _dropped, ...rest } = source;
                return {
                    config: {
                        ...rest,
                        basis: basis.toJSON(),
                        name: `${material.name} - ${basis.formula}`,
                    },
                    label: `${material.name} - ${basis.formula}`,
                };
            });
            return { ok: true as const, configs };
        } catch (e) {
            return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
        }
    }, [xyz, material]);

    const count = forecast.ok ? forecast.configs.length : 0;
    const tooMany = count > MAX_MATERIALS;

    return (
        <section className="md2-panel" aria-label="Combinatorial set">
            <header className="md2-panel-head">
                <span className="md2-icon" aria-hidden="true">
                    ⋈
                </span>
                <h2 className="md2-panel-title">Combinatorial set</h2>
                <span className="md2-badge" data-engine="native">
                    NATIVE
                </span>
            </header>
            <div className="md2-panel-body">
                <div className="md2-section-title">BASIS WITH COMBINATIONS</div>
                <textarea
                    className="md2-basis-edit"
                    rows={8}
                    value={xyz}
                    aria-label="Combinatorial basis in XYZ format"
                    onChange={(e) => setXyz(e.target.value)}
                />
                <div className="md2-note">
                    Use <code>Si/Ge</code> for a substitution set and <code>Si/vac</code> for
                    vacancies — the same syntax as before.
                </div>
                {forecast.ok ? (
                    <div className={`md2-predict${tooMany ? " md2-predict-error" : ""}`}>
                        → {count} material{count === 1 ? "" : "s"} (one set)
                        {tooMany ? ` · over the ${MAX_MATERIALS} limit` : ""}
                    </div>
                ) : (
                    <div className="md2-predict md2-predict-error">{forecast.error}</div>
                )}
            </div>
            <div className="md2-actions">
                <button type="button" className="md2-btn" onClick={onCancel}>
                    Cancel
                </button>
                <button
                    type="button"
                    className="md2-btn md2-btn-primary"
                    disabled={!forecast.ok || !count || tooMany}
                    onClick={() => forecast.ok && onApply(forecast.configs, xyz)}
                >
                    Apply — adds 1 step
                </button>
            </div>
        </section>
    );
}
