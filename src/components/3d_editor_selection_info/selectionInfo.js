export const SELECTION_HINTS = "Shift+U / Shift+D switch material";

const SUBSCRIPT_DIGITS = "₀₁₂₃₄₅₆₇₈₉";
const IMAGE_OFFSETS = [-1, 0, 1];

function toSubscript(number) {
    return String(number).replace(/\d/g, (d) => SUBSCRIPT_DIGITS[Number(d)]);
}

function subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function norm(v) {
    return Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/** Angle in degrees between two displacement vectors sharing an origin atom. */
function angleBetween(u, v) {
    const lengths = norm(u) * norm(v);
    if (!lengths) return null;
    // Clamp: accumulated float error can push the ratio just outside acos's domain.
    return (Math.acos(Math.min(1, Math.max(-1, dot(u, v) / lengths))) * 180) / Math.PI;
}

/** Crystal (fractional) coordinates, read without disturbing the units the session stores. */
function getCrystalCoordinates(material) {
    const copy = material.clone();
    copy.toCrystal();
    return copy.getBasis().coordinates.map((c) => c.value);
}

/** Rows of the lattice matrix: `[a, b, c]`, each a cartesian vector in ångström. */
function getLatticeVectors(material) {
    const vectors = material.getLattice().vectorArrays;
    return Array.isArray(vectors) && vectors.length === 3 ? vectors : null;
}

function crystalToCartesian(fractional, vectors) {
    return [0, 1, 2].map((axis) =>
        fractional.reduce((sum, f, vectorIndex) => sum + f * vectors[vectorIndex][axis], 0),
    );
}

/**
 * Cartesian vector from atom `from` to atom `to`, taking the nearest periodic image.
 *
 * In a crystal the pair a scientist means is the closest one, which for atoms near opposite faces
 * of the cell runs through the boundary rather than back across the cell: in a 3.87 Å cell, sites
 * at 0.0 and 0.9 along `a` are 0.39 Å apart, not 3.48 Å. All 27 neighbouring images are checked
 * because wrapping fractional offsets alone is not correct for strongly skewed (triclinic) cells.
 * Non-periodic materials have no images, so their coordinates are used as they are.
 */
function displacement(material, coordinates, from, to, vectors) {
    const delta = subtract(coordinates[to], coordinates[from]);
    if (material.isNonPeriodic) return crystalToCartesian(delta, vectors);

    let nearest = crystalToCartesian(delta, vectors);
    let nearestLength = norm(nearest);
    IMAGE_OFFSETS.forEach((da) =>
        IMAGE_OFFSETS.forEach((db) =>
            IMAGE_OFFSETS.forEach((dc) => {
                const candidate = crystalToCartesian(
                    [delta[0] + da, delta[1] + db, delta[2] + dc],
                    vectors,
                );
                const length = norm(candidate);
                if (length < nearestLength) {
                    nearestLength = length;
                    nearest = candidate;
                }
            }),
        ),
    );
    return nearest;
}

function labelFor(elements, atomIndex) {
    return `${elements[atomIndex]?.value ?? "?"}${toSubscript(atomIndex + 1)}`;
}

/**
 * Human-readable summary of the atoms selected in the 3D editor: the atom itself for one, the
 * bond length for two, the angle for three.
 */
export function describeSelection(material, selectedIndices) {
    let elements = [];
    try {
        elements = material ? material.getBasis().elements : [];
    } catch (error) {
        elements = [];
    }
    const indices = (selectedIndices || []).filter(
        (i) => Number.isInteger(i) && i >= 0 && i < elements.length,
    );
    if (!material || indices.length === 0) {
        return { isEmpty: true, text: "No atoms selected", tooltip: undefined };
    }

    const labels = indices.map((i) => labelFor(elements, i));
    try {
        const coordinates = getCrystalCoordinates(material);
        if (indices.length === 1) {
            const [x, y, z] = coordinates[indices[0]];
            return {
                isEmpty: false,
                text: `${labels[0]} @ (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})`,
                tooltip: "Crystal coordinates of the selected atom",
            };
        }
        const vectors = getLatticeVectors(material);
        if (vectors && indices.length === 2) {
            const distance = norm(
                displacement(material, coordinates, indices[0], indices[1], vectors),
            );
            return {
                isEmpty: false,
                text: `${labels.join("–")} · d = ${distance.toFixed(3)} Å`,
                tooltip: "Distance to the nearest periodic image of the second atom",
            };
        }
        if (vectors && indices.length === 3) {
            // Both arms are measured from the middle atom, which is the vertex of the angle.
            const angle = angleBetween(
                displacement(material, coordinates, indices[1], indices[0], vectors),
                displacement(material, coordinates, indices[1], indices[2], vectors),
            );
            const angleText = angle === null ? "—" : `${angle.toFixed(1)}°`;
            return {
                isEmpty: false,
                text: `${labels.join("–")} · ∠ = ${angleText}`,
                tooltip: `Angle at ${labels[1]}, the second atom selected`,
            };
        }
    } catch (error) {
        // Fall through to the plain count below rather than blanking the whole status bar.
    }
    return {
        isEmpty: false,
        text: `${indices.length} atoms selected`,
        tooltip: labels.join(", "),
    };
}

/** Formula, atom count and lattice of the active material, for the status bar. */
export function describeMaterial(material) {
    if (!material) return { text: "—" };
    const parts = [];
    try {
        if (material.formula) parts.push(material.formula);
        const atomsCount = material.getBasis().elements.length;
        if (atomsCount) parts.push(`${atomsCount} ${atomsCount === 1 ? "atom" : "atoms"}`);
        if (material.lattice?.type) parts.push(material.lattice.type);
        if (material.isNonPeriodic) parts.push("non-periodic");
    } catch (error) {
        // A material that cannot describe itself should not take the status bar down with it.
    }
    return { text: parts.length ? parts.join(" · ") : "—" };
}
