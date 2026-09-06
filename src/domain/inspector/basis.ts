/**
 * The basis as a list of sites, and back again.
 *
 * The table and the text view are two renderings of one string: every edit, from either, is written
 * through the same `set-basis` operation. made.js parses and re-renders the XYZ form — constraints
 * included — so there is no second representation to keep in step, and no way for the two views to
 * disagree about what was stored.
 */

export interface BasisSite {
    element: string;
    x: string;
    y: string;
    z: string;
    /** Movement allowed along each axis; all true means unconstrained. */
    constraints: [boolean, boolean, boolean];
}

const UNCONSTRAINED: [boolean, boolean, boolean] = [true, true, true];

export function parseBasisXyz(text: string): BasisSite[] {
    return text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [element, x, y, z, ...rest] = line.split(/\s+/);
            const constraints: [boolean, boolean, boolean] =
                rest.length >= 3
                    ? [rest[0] !== "0", rest[1] !== "0", rest[2] !== "0"]
                    : [...UNCONSTRAINED];
            return { element, x: x ?? "0", y: y ?? "0", z: z ?? "0", constraints };
        });
}

function formatCoordinate(value: string): string {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed.toFixed(6) : value;
}

/**
 * Constraints are written only when at least one site is actually constrained.
 *
 * An untouched basis has to serialise exactly as it did before the table existed — appending
 * "1 1 1" to every line would be a change of stored content for a material nobody edited.
 */
export function serializeBasisXyz(sites: BasisSite[]): string {
    const anyConstrained = sites.some((site) => site.constraints.some((allowed) => !allowed));
    return sites
        .map((site) => {
            const coordinates = [site.x, site.y, site.z].map(formatCoordinate);
            const columns = [site.element, ...coordinates];
            if (anyConstrained) {
                columns.push(...site.constraints.map((allowed) => (allowed ? "1" : "0")));
            }
            return columns.join(" ");
        })
        .join("\n");
}

/** A new site starts where the user can see it and adjust it, not at a hidden origin. */
export function emptySite(element = "Si"): BasisSite {
    return { element, x: "0", y: "0", z: "0", constraints: [...UNCONSTRAINED] };
}
