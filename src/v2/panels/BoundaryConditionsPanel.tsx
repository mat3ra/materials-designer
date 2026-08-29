/**
 * Boundary conditions — v1's BoundaryConditionsDialog as a non-blocking panel.
 *
 * The options come from the same wave.js enum v1 used (pbc / bc1 / bc2 / bc3
 * with their long names), the offset is in ångström and cannot be negative,
 * and — as in v1 — the fields open on the material's current settings and
 * re-initialise when the active material changes.
 */
import type Material from "@mat3ra/made/dist/js/Material";
import { BOUNDARY_CONDITIONS } from "@mat3ra/wave.js/dist/enums";
import React, { useEffect, useMemo, useRef, useState } from "react";

import type { Forecast, OperationPanelProps } from "./shared";
import {
    formatNumber,
    NumberField,
    PANEL_META,
    PanelFrame,
    parseNumber,
    PredictedResult,
    Section,
    useFieldIds,
    useForecast,
} from "./shared";

const TYPE = "boundary-conditions";
const DEFAULT_TYPE = "pbc";
const DEFAULT_OFFSET = 0;

export interface BoundaryConditionsParams {
    type: string;
    offset: number;
}

interface Draft {
    boundaryType: string;
    offset: string;
}

/** v1 read `material.boundaryConditions`; on the 2.0 spine it is metadata. */
function currentConditions(material: Material): BoundaryConditionsParams {
    const metadata = material.metadata as unknown as
        | { boundaryConditions?: { type?: string; offset?: number } }
        | undefined;
    const stored = metadata?.boundaryConditions;
    return {
        type: stored?.type || DEFAULT_TYPE,
        offset: typeof stored?.offset === "number" ? stored.offset : DEFAULT_OFFSET,
    };
}

function toDraft(conditions: BoundaryConditionsParams): Draft {
    return { boundaryType: conditions.type, offset: String(conditions.offset) };
}

function nameOf(boundaryType: string): string {
    const option = BOUNDARY_CONDITIONS.find((entry) => entry.type === boundaryType);
    return option ? option.name : boundaryType;
}

export function BoundaryConditionsPanel({
    material,
    onApply,
    onCancel,
}: OperationPanelProps): JSX.Element {
    const current = currentConditions(material);
    const [draft, setDraft] = useState<Draft>(() => toDraft(current));
    const fieldId = useFieldIds("bc");

    // v1 re-initialised the dialog whenever it received new props; a panel that
    // outlives a material switch has to do the same or it edits the wrong one.
    const seen = useRef(material);
    useEffect(() => {
        if (seen.current === material) return;
        seen.current = material;
        setDraft(toDraft(currentConditions(material)));
    }, [material]);

    const { params, invalidReason } = useMemo(() => {
        const offset = parseNumber(draft.offset);
        if (offset === null) {
            return { params: null, invalidReason: "Offset must be a number." };
        }
        if (offset < 0) {
            return { params: null, invalidReason: "Offset cannot be negative." };
        }
        const value: BoundaryConditionsParams = { type: draft.boundaryType, offset };
        return { params: value, invalidReason: null };
    }, [draft]);

    const forecast: Forecast = useForecast(material, TYPE, params, invalidReason);
    const selected = BOUNDARY_CONDITIONS.find((entry) => entry.type === draft.boundaryType);

    const handleApply = () => {
        if (!params || !forecast.ok) return;
        onApply(TYPE, params);
    };

    return (
        <PanelFrame
            icon={PANEL_META["boundary-conditions"].icon}
            title={PANEL_META["boundary-conditions"].title}
            canApply={forecast.ok}
            onApply={handleApply}
            onCancel={onCancel}
        >
            <Section
                title="CONDITIONS"
                hint={`current: ${current.type} · ${formatNumber(current.offset)} Å`}
                onRecall={() => setDraft(toDraft(current))}
            >
                <div className="md2-field-row">
                    <label htmlFor={fieldId("type")}>Type</label>
                    <select
                        id={fieldId("type")}
                        className="md2-field"
                        value={draft.boundaryType}
                        onChange={(event) =>
                            setDraft((previous) => ({
                                ...previous,
                                boundaryType: event.target.value,
                            }))
                        }
                    >
                        {BOUNDARY_CONDITIONS.map((entry) => (
                            <option key={entry.type} value={entry.type}>
                                {entry.name}
                            </option>
                        ))}
                    </select>
                </div>
                <NumberField
                    id={fieldId("offset")}
                    label="Offset"
                    unit="Å"
                    value={draft.offset}
                    onChange={(value) => setDraft((previous) => ({ ...previous, offset: value }))}
                    min={0}
                    step={0.1}
                />
                <p className="md2-note">
                    {selected?.isNonPeriodic
                        ? `${nameOf(draft.boundaryType)} describes a non-periodic environment.`
                        : "The cell repeats in all three directions."}
                </p>
            </Section>

            <Section title="PREDICTED RESULT">
                <PredictedResult forecast={forecast} />
                <p className="md2-note">
                    Boundary conditions are stored as material metadata: the atoms and the lattice
                    are unchanged.
                </p>
            </Section>
        </PanelFrame>
    );
}

export default BoundaryConditionsPanel;
