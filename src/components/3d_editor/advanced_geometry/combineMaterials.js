import { Made } from "@mat3ra/made";
// `Made` exports Basis but not ConstrainedBasis, and only the latter carries per-atom constraints
// through to the merged basis. Deep import as in MDMaterial.
import { ConstrainedBasis } from "@mat3ra/made/dist/js/basis/constrained_basis";

import { MDMaterial } from "../../../MDMaterial";

/** Angstrom along x between guests, so several of them do not land on top of each other. */
export const DEFAULT_OFFSET_STEP = 2;

export function getDefaultOffset(guestIndex) {
    return [DEFAULT_OFFSET_STEP * (guestIndex + 1), 0, 0];
}

export function getDefaultName(host, guestMaterials) {
    const names = [host, ...guestMaterials].map((material) => material.name || material.formula);
    return names.join(" + ");
}

/**
 * Appends every atom of `material` to `sink`, in cartesian angstrom and translated by `offset`.
 *
 * Each source is converted to cartesian in its own cell, which preserves that material's internal
 * geometry exactly; placing it into the host's frame is then a pure translation.
 */
function collectAtoms(material, offset, sink) {
    // A fresh ConstrainedBasis on every call, so mutating it does not touch the source material.
    const basis = material.getBasis();
    basis.toCartesian();
    const [dx, dy, dz] = offset;

    // made reads labels two ways - by `label.id` in `atomicLabelsArray`, by array position in
    // `elementsWithLabelsArray` - so they have to come out dense for the two to agree.
    const labelByIndex = new Array(basis.elements.length).fill("");
    (basis.labels || []).forEach(({ id, value }) => {
        if (Number.isInteger(id) && id >= 0 && id < labelByIndex.length) labelByIndex[id] = value;
    });

    basis.elementsAndCoordinatesArray.forEach(([element, coordinate], index) => {
        sink.elements.push(element);
        // A new array: `coordinate` is a live reference into the basis being read.
        sink.coordinates.push([coordinate[0] + dx, coordinate[1] + dy, coordinate[2] + dz]);
        // Positional lookup that defaults to unconstrained, which keeps constraints dense too.
        sink.constraints.push(basis.getConstraintByIndex(index));
        sink.labels.push(labelByIndex[index]);
    });
}

/**
 * Merges `guests` into `host` as a single material.
 *
 * The host keeps its lattice and contributes its atoms unmoved; each guest contributes the atoms
 * of its own unit cell - not a periodic tiling of them - translated by its cartesian `offset` in
 * angstrom. Guest atoms are free to land outside the host cell, and then carry fractional
 * coordinates outside [0, 1), which is what the 3D editor this replaces also produced.
 *
 * @param {Object} params
 * @param {MDMaterial} params.host material whose lattice and metadata the result inherits
 * @param {{material: MDMaterial, offset: number[]}[]} params.guests materials to place into it
 * @param {String} params.name name for the resulting material
 * @returns {MDMaterial}
 */
export function combineMaterials({ host, guests, name }) {
    const sink = { elements: [], coordinates: [], constraints: [], labels: [] };
    collectAtoms(host, [0, 0, 0], sink);
    guests.forEach(({ material, offset }) => collectAtoms(material, offset, sink));

    const basis = ConstrainedBasis.fromElementsCoordinatesAndConstraints({
        elements: sink.elements,
        coordinates: sink.coordinates,
        units: "cartesian",
        cell: host.getLattice().vectors,
        // Omit entirely when nothing is set, to keep the emitted basis as small as it was.
        labels: sink.labels.some(Boolean) ? sink.labels : [],
        constraints: sink.constraints.some((constraint) => !constraint.every(Boolean))
            ? sink.constraints
            : [],
    });
    basis.toCrystal();

    // The host's derived values describe the host alone: `derivedProperties` carries its volume
    // and, when non-periodic, an inchi that `updateHash` prefers over the basis; `src`/`external`/
    // `icsdId` point at a file this material no longer is.
    const { derivedProperties, src, external, icsdId, _id, ...config } = host.toJSON();
    const material = new MDMaterial({ ...config, basis: basis.toJSON(), name });
    material.cleanOnCopy();
    // The Material constructor keeps `config.formula` when it is present, so without this the
    // host's formula would survive onto a material that no longer has the host's composition.
    material.updateFormula();

    if (material.isNonPeriodic) {
        // Otherwise the guests sit outside a padding cube sized for the host alone.
        Made.tools.material.scaleLatticeToMakeNonPeriodic(material);
        Made.tools.material.translateAtomsToCenter(material);
    }

    return material;
}

/** Atoms closer together than their radii allow, as `[{id1, id2}]`. Advisory, never blocking. */
export function findOverlappingAtoms(material) {
    try {
        return material.getBasis().getOverlappingAtoms() || [];
    } catch (error) {
        // A material that cannot be inspected should not stop the user from creating it.
        return [];
    }
}
