/**
 * Inspector — properties of the current focus, in three tabs.
 *
 * Structure and Selection both write through the same operation path as every
 * transform, so editing a lattice field or a basis line is undoable next to a
 * supercell and shows up as its own Timeline chip.
 */
import type Material from "@mat3ra/made/dist/js/Material";
import React, { useEffect, useState } from "react";

import type { ResultDigest, SelectionModel } from "../core/types";
import { BasisEditor } from "./inspector/BasisEditor";
import { LatticeForm } from "./inspector/LatticeForm";

export interface InspectorProps {
    material: Material;
    digest: ResultDigest;
    selection: SelectionModel;
    onApply: (type: string, params: unknown) => void;
    /** Successive edits to the same field collapse into one step rather than one per keystroke. */
    onApplyCoalescing: (type: string, params: unknown) => void;
    theme: "dark" | "light";
}

type Tab = "structure" | "selection" | "display";

function ReadRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="md2-frow">
            <label>{label}</label>
            <div className="md2-fld md2-mono">{value}</div>
        </div>
    );
}

function StructureTab({
    material,
    digest,
    onApply,
    onApplyCoalescing,
    selection,
    theme,
}: {
    material: Material;
    digest: ResultDigest;
    onApply: (type: string, params: unknown) => void;
    onApplyCoalescing: (type: string, params: unknown) => void;
    selection: SelectionModel;
    theme: "dark" | "light";
}) {
    // v1's "scale vs preserve" choice, kept because the two give different structures and the
    // difference is invisible after the fact.
    const [preserveBasis, setPreserveBasis] = useState(true);
    const lattice = material.lattice as unknown as Record<string, number | string> | undefined;
    const isNonPeriodic = Boolean(
        (material as unknown as { isNonPeriodic?: boolean }).isNonPeriodic,
    );
    const boundary = (material.metadata as { boundaryConditions?: { type?: string } } | undefined)
        ?.boundaryConditions;

    return (
        <>
            <section className="md2-isec">
                <div className="md2-stitle">LATTICE</div>
                <ReadRow label="Type" value={String(lattice?.type ?? "—")} />
                {(["a", "b", "c"] as const).map((key) => (
                    <ReadRow
                        key={key}
                        label={key}
                        value={
                            typeof lattice?.[key] === "number"
                                ? `${(lattice[key] as number).toFixed(4)} Å`
                                : "—"
                        }
                    />
                ))}
                {(["alpha", "beta", "gamma"] as const).map((key) => (
                    <ReadRow
                        key={key}
                        label={key}
                        value={
                            typeof lattice?.[key] === "number"
                                ? `${(lattice[key] as number).toFixed(2)}°`
                                : "—"
                        }
                    />
                ))}
                <div className="md2-note">
                    Editable lattice fields with symmetry locking are Phase 1 work; the MVP shows
                    the values and keeps every mutation on the operation path.
                </div>
                <LatticeForm
                    lattice={lattice as never}
                    preserveBasis={preserveBasis}
                    onPreserveBasisChange={setPreserveBasis}
                    onApply={(next) => onApply("set-lattice", { lattice: next, preserveBasis })}
                />
            </section>

            <section className="md2-isec">
                <div className="md2-stitle">CELL</div>
                <button
                    type="button"
                    className="md2-btn"
                    onClick={() => onApply("conventional-cell", {})}
                    title="Replace with the conventional cell (recorded as a step)"
                >
                    Use conventional cell
                </button>
            </section>

            <section className="md2-isec">
                <div className="md2-stitle">PERIODICITY</div>
                <div className="md2-seg">
                    <button
                        type="button"
                        className={!isNonPeriodic ? "md2-on" : ""}
                        onClick={() => onApply("toggle-periodicity", { isNonPeriodic: false })}
                    >
                        Periodic 3D
                    </button>
                    <button
                        type="button"
                        className={isNonPeriodic ? "md2-on" : ""}
                        onClick={() => onApply("toggle-periodicity", { isNonPeriodic: true })}
                    >
                        Non-periodic
                    </button>
                </div>
                {boundary?.type && (
                    <div className="md2-note">Boundary conditions: {boundary.type}</div>
                )}
            </section>

            <section className="md2-isec">
                <div className="md2-stitle">FACTS</div>
                <ReadRow label="Formula" value={digest.formula} />
                <ReadRow label="Atoms" value={String(digest.atomCount)} />
            </section>

            <section className="md2-isec">
                <div className="md2-stitle">BASIS</div>
                <div className="md2-basis" role="group" aria-label="Basis lines">
                    {material
                        .getBasisAsXyz()
                        .trim()
                        .split("\n")
                        .map((line, index) => (
                            // The row index IS the site identity here (line n = site n), which is
                            // exactly what the selection model keys on.
                            <div
                                // eslint-disable-next-line react/no-array-index-key
                                key={index}
                                className={`md2-basis-line${
                                    selection.siteIds.includes(index) ? " md2-sel" : ""
                                }`}
                            >
                                <span className="md2-basis-idx">{index}</span>
                                {line}
                            </div>
                        ))}
                </div>
                <BasisEditor
                    xyz={material.getBasisAsXyz()}
                    units={
                        (material.basis as { units?: "crystal" | "cartesian" })?.units ?? "crystal"
                    }
                    theme={theme}
                    onCommit={(xyz) =>
                        onApplyCoalescing("set-basis", {
                            xyz,
                            units:
                                (material.basis as { units?: "crystal" | "cartesian" })?.units ??
                                "crystal",
                        })
                    }
                />
            </section>
        </>
    );
}

/**
 * The basis, as text. It is also the accessible projection of the canvas: a
 * screen reader can read and edit coordinates here even though the 3D scene is
 * opaque to it.
 */
/**
 * What is selected, and what that means.
 *
 * Editing the basis lives in Structure, where the lattice and the sites are described together;
 * this tab reports the selection and reads from the same shared store the viewport does.
 */
function SelectionTab({ selection }: { selection: SelectionModel }) {
    return (
        <section className="md2-isec">
            <div className="md2-stitle">
                SELECTION
                <span className="md2-sact">
                    {selection.siteIds.length
                        ? `sites ${selection.siteIds.join(", ")}`
                        : "click an atom in 3D"}
                </span>
            </div>
            <div className="md2-note">
                Selection is shared state: picking an atom in the viewport highlights its line
                below, and both read the same store.
            </div>
        </section>
    );
}

export function Inspector({
    material,
    digest,
    selection,
    onApply,
    onApplyCoalescing,
    theme,
}: InspectorProps) {
    const [tab, setTab] = useState<Tab>("structure");

    return (
        <div className="md2-inspector">
            <div className="md2-itabs" role="tablist">
                {(["structure", "selection", "display"] as Tab[]).map((name) => (
                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === name}
                        key={name}
                        className={`md2-itab${tab === name ? " md2-on" : ""}`}
                        onClick={() => setTab(name)}
                    >
                        {name[0].toUpperCase() + name.slice(1)}
                        {name === "selection" && selection.siteIds.length
                            ? ` ·${selection.siteIds.length}`
                            : ""}
                    </button>
                ))}
            </div>
            <div className="md2-ibody">
                {tab === "structure" && (
                    <StructureTab
                        material={material}
                        digest={digest}
                        onApply={onApply}
                        onApplyCoalescing={onApplyCoalescing}
                        selection={selection}
                        theme={theme}
                    />
                )}
                {tab === "selection" && <SelectionTab selection={selection} />}
                {tab === "display" && (
                    <div className="md2-note">
                        Display settings live in the viewport toolbar for now. In the full design
                        they move here — and, unlike operations, they are never recorded in the
                        Timeline: camera and rendering state are view, not model.
                    </div>
                )}
            </div>
        </div>
    );
}
