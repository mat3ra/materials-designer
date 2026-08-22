export const SELECTION_HINTS = "Shift+U / Shift+D switch material";

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
