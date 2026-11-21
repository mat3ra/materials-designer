/**
 * The editable lattice.
 *
 * v1 had this form and 2.0 shipped a read-only display, which is why "create a material with this
 * lattice" — the phrase seventeen of the platform's own features use to build their fixtures —
 * had nothing to type into.
 *
 * The form is disclosed rather than always open: six numbers and a symmetry choice would otherwise
 * dominate a panel that also has to show the basis. Edits are staged and applied together, because
 * a lattice half-way between two symmetries is not a structure anyone wants recorded.
 */
import { Made } from "@mat3ra/made";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import React, { useEffect, useState } from "react";

/** The Bravais types made.js accepts, in the order v1 listed them. */
const LATTICE_TYPES = [
    "CUB",
    "BCC",
    "FCC",
    "TET",
    "BCT",
    "ORC",
    "ORCF",
    "ORCI",
    "ORCC",
    "HEX",
    "RHL",
    "MCL",
    "MCLC",
    "TRI",
];

const LENGTHS = ["a", "b", "c"] as const;
const ANGLES = ["alpha", "beta", "gamma"] as const;

export interface LatticeValue {
    type: string;
    a: number;
    b: number;
    c: number;
    alpha: number;
    beta: number;
    gamma: number;
}

export interface LatticeFormProps {
    lattice: Partial<LatticeValue> | undefined;
    /** "Preserve interatomic distances" converts through cartesian; the alternative scales. */
    preserveBasis: boolean;
    onPreserveBasisChange: (value: boolean) => void;
    onApply: (lattice: LatticeValue) => void;
}

function toDraft(lattice: Partial<LatticeValue> | undefined): Record<string, string> {
    return {
        type: String(lattice?.type ?? "CUB"),
        ...Object.fromEntries(
            [...LENGTHS, ...ANGLES].map((key) => [key, String(lattice?.[key] ?? "")]),
        ),
    };
}

/**
 * Re-derive the dependent parameters after an edit.
 *
 * A Bravais type is a set of constraints, not a label: choosing TET fixes the angles at 90° and
 * ties b to a, and made.js knows those rules. Without this, picking a type left the previous
 * type's angles in the form and produced a structure whose lattice contradicted its own symmetry —
 * which is exactly what the platform's fixtures caught. v1 ran the same function on every change;
 * `isConventional` tells made.js to keep the edited value and adjust around it.
 */
function withSymmetry(
    draft: Record<string, string>,
    isConventional: boolean,
    base: Partial<LatticeValue> | undefined,
) {
    const numeric = Object.fromEntries(
        [...LENGTHS, ...ANGLES].map((key) => [key, Number(draft[key])]),
    );
    // Nothing to derive from a half-typed number, and made.js computes with these: handing it a
    // NaN surfaces deep inside its maths library as an unreadable type error.
    if (Object.values(numeric).some((value) => !Number.isFinite(value))) return draft;
    const derived = (
        Made.Lattice as unknown as {
            getDefaultPrimitiveLatticeConfigByType: (
                config: Record<string, unknown>,
                isConventional?: boolean,
            ) => Record<string, unknown>;
        }
    )
        // The material's own lattice underneath: it carries `units` and the vectors, and made.js
        // computes with them. Handing over the six numbers alone leaves units undefined and the
        // maths library fails on a value it cannot type.
        .getDefaultPrimitiveLatticeConfigByType(
            { ...(base as Record<string, unknown>), ...numeric, type: draft.type },
            isConventional,
        );
    return toDraft(derived as Partial<LatticeValue>);
}

export function LatticeForm({
    lattice,
    preserveBasis,
    onPreserveBasisChange,
    onApply,
}: LatticeFormProps) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(() => toDraft(lattice));

    // Follow the material while the form is closed; hold the draft while it is open, so an edit
    // elsewhere does not silently rewrite half-typed numbers.
    useEffect(() => {
        if (!open) setDraft(toDraft(lattice));
    }, [lattice, open]);

    function apply() {
        // Derived once, here, rather than on every keystroke: recomputing while someone types
        // rewrites the field under the cursor. v1 did it per change and reformatted half-typed
        // numbers as a result.
        const settled = withSymmetry(draft, true, lattice);
        const next: LatticeValue = {
            type: settled.type,
            ...(Object.fromEntries(
                [...LENGTHS, ...ANGLES].map((key) => [key, Number(settled[key])]),
            ) as Omit<LatticeValue, "type">),
        };
        if ([...LENGTHS, ...ANGLES].some((key) => !Number.isFinite(next[key]))) return;
        setDraft(settled);
        onApply(next);
    }

    return (
        <div className="crystal-lattice md2-lattice">
            <div
                role="button"
                tabIndex={0}
                className="md2-lattice-trigger"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") setOpen((value) => !value);
                }}
            >
                Edit lattice
                <span className="md2-lattice-caret">{open ? "▴" : "▾"}</span>
            </div>

            {/*
             * Hidden rather than unmounted, for the same reason the panel regions are: something
             * that watches this form close needs it to still be there to watch, and the draft
             * survives a stray toggle.
             */}
            <div className="crystal-lattice-config md2-lattice-config" hidden={!open}>
                <label className="md2-frow" htmlFor="lattice-type">
                    <span className="md2-flabel">Type</span>
                    <Select
                        id="lattice-type"
                        data-tid="type"
                        value={draft.type}
                        size="small"
                        onChange={(event) =>
                            setDraft(
                                withSymmetry(
                                    { ...draft, type: String(event.target.value) },
                                    false,
                                    lattice,
                                ),
                            )
                        }
                    >
                        {LATTICE_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </label>

                {LENGTHS.map((key) => (
                    <label className="md2-frow" key={key} htmlFor={`lattice-${key}`}>
                        <span className="md2-flabel">{key}</span>
                        <input
                            id={`lattice-${key}`}
                            name={key}
                            value={draft[key]}
                            inputMode="decimal"
                            onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                        />
                        <span className="md2-unit">Å</span>
                    </label>
                ))}

                {ANGLES.map((key) => (
                    <label className="md2-frow" key={key} htmlFor={`lattice-${key}`}>
                        <span className="md2-flabel">{key}</span>
                        <input
                            id={`lattice-${key}`}
                            name={key}
                            value={draft[key]}
                            inputMode="decimal"
                            onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                        />
                        <span className="md2-unit">°</span>
                    </label>
                ))}

                <label className="md2-frow md2-lattice-preserve" htmlFor="lattice-preserve">
                    <input
                        id="lattice-preserve"
                        type="checkbox"
                        checked={preserveBasis}
                        onChange={(event) => onPreserveBasisChange(event.target.checked)}
                    />
                    <span>Preserve interatomic distances</span>
                </label>

                <button
                    type="button"
                    className="save-lattice-config md2-btn md2-btn-primary"
                    onClick={apply}
                >
                    Apply lattice
                </button>
            </div>
        </div>
    );
}
