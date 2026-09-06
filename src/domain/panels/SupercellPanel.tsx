/**
 * Supercell — v1's SupercellDialog as a non-blocking panel.
 *
 * Same contract as v1: a 3x3 integer scaling matrix, identity by default, and
 * the single hard rule that its determinant must be non-zero. What is new is
 * the forecast: the registry's closed form scales the atom count by |det|, so
 * the panel can say "8 -> 72 atoms" (and refuse a 20x20x20) before Apply.
 */
import type { Matrix3X3Schema } from "@mat3ra/esse/dist/js/types";
import React, { useMemo, useState } from "react";

import { determinant as matrixDeterminant } from "../../core/registry";
import type { Forecast, OperationPanelProps } from "./shared";
import {
    formatNumber,
    isWholeNumber,
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

const TYPE = "supercell";
const IDENTITY: string[] = ["1", "0", "0", "0", "1", "0", "0", "0", "1"];

/** Row-major cell name, matching v1's m11..m33 field labels. */
function cellName(index: number): string {
    return `m${Math.floor(index / 3) + 1}${(index % 3) + 1}`;
}

function toCells(matrix: number[][]): string[] {
    return IDENTITY.map((fallback, index) => {
        const value = matrix[Math.floor(index / 3)]?.[index % 3];
        return typeof value === "number" ? String(value) : fallback;
    });
}

export interface SupercellParams {
    matrix: number[][];
}

/** "3x3x1" — the diagonal, which is what a supercell is called in practice. */
function summarize(matrix: number[][]): string {
    return `${formatNumber(matrix[0][0])}×${formatNumber(matrix[1][1])}×${formatNumber(
        matrix[2][2],
    )}`;
}

export function SupercellPanel({
    material,
    onApply,
    onCancel,
    initialParams,
    applyLabel,
}: OperationPanelProps): JSX.Element {
    const recalled = recallLastUsed<SupercellParams>(TYPE);
    const [cells, setCells] = useState<string[]>(() => {
        const preset = (initialParams as SupercellParams | undefined)?.matrix;
        if (preset) return toCells(preset);
        return recalled ? toCells(recalled.params.matrix) : IDENTITY;
    });
    const fieldId = useFieldIds(TYPE);

    const { params, invalidReason, determinant, hasFraction } = useMemo(() => {
        const numbers = cells.map(parseNumber);
        if (numbers.some((value) => value === null)) {
            return {
                params: null,
                invalidReason: "Every matrix entry must be a number.",
                determinant: null,
                hasFraction: false,
            };
        }
        const values = numbers as number[];
        const matrix = [values.slice(0, 3), values.slice(3, 6), values.slice(6, 9)];
        const det = matrixDeterminant(matrix as Matrix3X3Schema);
        return {
            params: { matrix } as SupercellParams,
            // v1's only rule, kept verbatim including the message.
            invalidReason: det === 0 ? "Matrix determinant must be non-zero." : null,
            determinant: det,
            hasFraction: values.some((value) => !isWholeNumber(value)),
        };
    }, [cells]);

    const forecast: Forecast = useForecast(material, TYPE, params, invalidReason);

    const setCell = (index: number, value: string) =>
        setCells((previous) => previous.map((cell, i) => (i === index ? value : cell)));

    const handleApply = () => {
        if (!params || !forecast.ok) return;
        rememberLastUsed(TYPE, params, summarize(params.matrix));
        onApply(TYPE, params);
    };

    return (
        <PanelFrame
            type={TYPE}
            applyLabel={applyLabel}
            icon={PANEL_META.supercell.icon}
            title={PANEL_META.supercell.title}
            canApply={forecast.ok}
            onApply={handleApply}
            onCancel={onCancel}
        >
            <Section
                title="SCALING MATRIX"
                hint={recalled ? `last used: ${recalled.summary}` : "default: identity"}
                onRecall={() => setCells(recalled ? toCells(recalled.params.matrix) : IDENTITY)}
            >
                <div className="md2-matrix-grid">
                    {cells.map((cell, index) => (
                        <input
                            key={cellName(index)}
                            id={fieldId(cellName(index))}
                            data-tid={cellName(index)}
                            className="md2-field"
                            type="number"
                            inputMode="numeric"
                            step={1}
                            aria-label={`Matrix element ${cellName(index)}`}
                            value={cell}
                            onChange={(event) => setCell(index, event.target.value)}
                        />
                    ))}
                </div>
                <p className="md2-note">
                    {"Any integer matrix; det ≠ 0. "}
                    {determinant === null
                        ? "det = —"
                        : `det = ${formatNumber(determinant)} ${determinant === 0 ? "✗" : "✓"}`}
                </p>
                {hasFraction ? (
                    <p className="md2-note md2-note-warn">
                        Non-integer entries do not tile the original cell; the result may not be
                        commensurate with it.
                    </p>
                ) : null}
            </Section>

            <Section title="PREDICTED RESULT">
                <PredictedResult forecast={forecast} />
                <PreviewNote forecast={forecast} />
            </Section>
        </PanelFrame>
    );
}

export default SupercellPanel;
