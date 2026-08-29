/**
 * Inspector — properties of the current focus, in three tabs.
 *
 * Structure and Selection both write through the same operation path as every
 * transform, so editing a lattice field or a basis line is undoable next to a
 * supercell and shows up as its own Timeline chip.
 */
import type Material from "@mat3ra/made/dist/js/Material";
import React, { useEffect, useState } from "react";

import type { ResultDigest, SelectionModel } from "../state/types";

export interface InspectorProps {
    material: Material;
    digest: ResultDigest;
    selection: SelectionModel;
    onApply: (type: string, params: unknown) => void;
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
}: {
    material: Material;
    digest: ResultDigest;
    onApply: (type: string, params: unknown) => void;
}) {
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
        </>
    );
}

/**
 * The basis, as text. It is also the accessible projection of the canvas: a
 * screen reader can read and edit coordinates here even though the 3D scene is
 * opaque to it.
 */
function SelectionTab({
    material,
    selection,
    onApply,
}: {
    material: Material;
    selection: SelectionModel;
    onApply: (type: string, params: unknown) => void;
}) {
    // Read and write in the same units. getBasisAsXyz() emits whatever the
    // basis currently holds, so writing back with a hardcoded "crystal" would
    // reinterpret angstroms as fractions and destroy a cartesian structure.
    const units = (material.basis as { units?: "crystal" | "cartesian" })?.units ?? "crystal";
    const current = material.getBasisAsXyz();
    const [draft, setDraft] = useState(current);
    const [dirty, setDirty] = useState(false);

    // Follow the material unless the user is mid-edit, so applying an operation
    // elsewhere does not silently discard their typing. A successful apply
    // changes `current`, which clears the dirty flag; a rejected one does not,
    // so the draft survives to be corrected.
    useEffect(() => {
        setDraft(current);
        setDirty(false);
    }, [current]);

    const lines = draft.split("\n");

    return (
        <>
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

            <section className="md2-isec">
                <div className="md2-stitle">BASIS (XYZ)</div>
                <div className="md2-basis" role="group" aria-label="Basis lines">
                    {lines.map((line, index) => (
                        <div
                            // The row index IS the site identity here (line n = site n),
                            // which is exactly what the selection model keys on.
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
                <textarea
                    className="md2-basis-edit"
                    aria-label="Edit basis in XYZ format"
                    value={draft}
                    onChange={(e) => {
                        setDraft(e.target.value);
                        setDirty(true);
                    }}
                    rows={5}
                />
                <div className="md2-ibtnrow">
                    <button
                        type="button"
                        className="md2-btn"
                        disabled={!dirty}
                        onClick={() => {
                            setDraft(current);
                            setDirty(false);
                        }}
                    >
                        Discard
                    </button>
                    <button
                        type="button"
                        className="md2-btn md2-btn-primary"
                        disabled={!dirty}
                        onClick={() => {
                            // Keep the draft dirty: if the operation is rejected
                            // the effect below must not overwrite what the user
                            // typed with the unchanged material's basis.
                            onApply("set-basis", { xyz: draft, units });
                        }}
                    >
                        Apply — adds 1 step
                    </button>
                </div>
            </section>
        </>
    );
}

export function Inspector({ material, digest, selection, onApply }: InspectorProps) {
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
                    <StructureTab material={material} digest={digest} onApply={onApply} />
                )}
                {tab === "selection" && (
                    <SelectionTab material={material} selection={selection} onApply={onApply} />
                )}
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
