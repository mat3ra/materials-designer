/**
 * Slab / Surface — v1's SurfaceDialog as a non-blocking panel.
 *
 * Fields, defaults and input bounds are v1's: Miller (h k l) = (1 0 0), three
 * layers, vacuum ratio 0.8 (step 0.01, max 0.99) and a 1x1 in-plane supercell.
 * The registry has no closed form for a slab, so the forecast builds one and
 * measures it — which is also what turns an impossible cut into a message
 * instead of a thrown dialog.
 */
import React, { useMemo, useState } from "react";

import type { SurfaceParams } from "../state/registry";
import type { Forecast, OperationPanelProps } from "./shared";
import {
    isWholeNumber,
    NumberField,
    PANEL_META,
    PanelFrame,
    parseNumber,
    PredictedResult,
    PreviewNote,
    recallLastUsed,
    rememberLastUsed,
    Section,
    useFieldIds,
    useForecast,
} from "./shared";

const TYPE = "surface";

type Draft = Record<keyof SurfaceParams, string>;

/** v1's SurfaceDialog constructor state. */
const DEFAULTS: Draft = {
    h: "1",
    k: "0",
    l: "0",
    thickness: "3",
    vacuumRatio: "0.8",
    vx: "1",
    vy: "1",
};

function toDraft(params: SurfaceParams): Draft {
    return {
        h: String(params.h),
        k: String(params.k),
        l: String(params.l),
        thickness: String(params.thickness),
        vacuumRatio: String(params.vacuumRatio),
        vx: String(params.vx),
        vy: String(params.vy),
    };
}

function summarize(params: SurfaceParams): string {
    return `(${params.h}${params.k}${params.l}) · ${params.thickness} layers`;
}

interface Parsed {
    params: SurfaceParams | null;
    invalidReason: string | null;
}

/** The bounds v1 declared on its inputs, enforced rather than merely hinted. */
function parseDraft(draft: Draft): Parsed {
    const numbers: Partial<Record<keyof SurfaceParams, number>> = {};
    const keys = Object.keys(DEFAULTS) as (keyof SurfaceParams)[];
    for (let i = 0; i < keys.length; i += 1) {
        const value = parseNumber(draft[keys[i]]);
        if (value === null) return { params: null, invalidReason: "Every field must be a number." };
        numbers[keys[i]] = value;
    }
    const params = numbers as SurfaceParams;
    const { h, k, l, thickness, vacuumRatio, vx, vy } = params;
    if ([h, k, l].some((v) => !isWholeNumber(v) || v < 0)) {
        return { params, invalidReason: "Miller indices must be whole numbers ≥ 0." };
    }
    if (h === 0 && k === 0 && l === 0) {
        return { params, invalidReason: "Miller indices cannot all be zero." };
    }
    if (!isWholeNumber(thickness) || thickness < 1) {
        return { params, invalidReason: "Thickness must be a whole number of layers ≥ 1." };
    }
    if (vacuumRatio < 0 || vacuumRatio > 0.99) {
        return { params, invalidReason: "Vacuum ratio must be between 0 and 0.99." };
    }
    if ([vx, vy].some((v) => !isWholeNumber(v) || v < 1)) {
        return { params, invalidReason: "In-plane dimensions must be whole numbers ≥ 1." };
    }
    return { params, invalidReason: null };
}

export function SurfacePanel({
    material,
    onApply,
    onCancel,
    initialParams,
    applyLabel,
}: OperationPanelProps): JSX.Element {
    const recalled = recallLastUsed<SurfaceParams>(TYPE);
    const [draft, setDraft] = useState<Draft>(() => {
        if (initialParams) return toDraft(initialParams as SurfaceParams);
        return recalled ? toDraft(recalled.params) : DEFAULTS;
    });
    const fieldId = useFieldIds(TYPE);

    const { params, invalidReason } = useMemo(() => parseDraft(draft), [draft]);
    const forecast: Forecast = useForecast(material, TYPE, params, invalidReason);

    const set = (key: keyof SurfaceParams) => (value: string) =>
        setDraft((previous) => ({ ...previous, [key]: value }));

    const handleApply = () => {
        if (!params || !forecast.ok) return;
        rememberLastUsed(TYPE, params, summarize(params));
        onApply(TYPE, params);
    };

    return (
        <PanelFrame
            applyLabel={applyLabel}
            icon={PANEL_META.surface.icon}
            title={PANEL_META.surface.title}
            canApply={forecast.ok}
            onApply={handleApply}
            onCancel={onCancel}
        >
            <Section
                title="MILLER INDICES"
                hint={recalled ? `last used: ${recalled.summary}` : "default: (100) · 3 layers"}
                onRecall={() => setDraft(recalled ? toDraft(recalled.params) : DEFAULTS)}
            >
                <NumberField
                    id={fieldId("h")}
                    label="Miller h"
                    value={draft.h}
                    onChange={set("h")}
                    min={0}
                    step={1}
                />
                <NumberField
                    id={fieldId("k")}
                    label="Miller k"
                    value={draft.k}
                    onChange={set("k")}
                    min={0}
                    step={1}
                />
                <NumberField
                    id={fieldId("l")}
                    label="Miller l"
                    value={draft.l}
                    onChange={set("l")}
                    min={0}
                    step={1}
                />
                <p className="md2-note">The plane cut from the bulk crystal, as (h k l).</p>
            </Section>

            <Section title="SLAB">
                <NumberField
                    id={fieldId("thickness")}
                    label="Thickness in layers"
                    value={draft.thickness}
                    onChange={set("thickness")}
                    min={1}
                    step={1}
                />
                <NumberField
                    id={fieldId("vacuumRatio")}
                    label="Vacuum ratio"
                    value={draft.vacuumRatio}
                    onChange={set("vacuumRatio")}
                    min={0}
                    max={0.99}
                    step={0.01}
                />
                <p className="md2-note">
                    Vacuum ratio is the fraction of the out-of-plane vector left empty: the cell is
                    stretched by a factor of 1 / (1 − ratio) along that axis.
                </p>
            </Section>

            <Section title="IN-PLANE SUPERCELL">
                <NumberField
                    id={fieldId("vx")}
                    label="Supercell dimension x"
                    value={draft.vx}
                    onChange={set("vx")}
                    min={1}
                    step={1}
                />
                <NumberField
                    id={fieldId("vy")}
                    label="Supercell dimension y"
                    value={draft.vy}
                    onChange={set("vy")}
                    min={1}
                    step={1}
                />
            </Section>

            <Section title="PREDICTED RESULT">
                <PredictedResult forecast={forecast} />
                <PreviewNote forecast={forecast} />
            </Section>
        </PanelFrame>
    );
}

export default SurfacePanel;
