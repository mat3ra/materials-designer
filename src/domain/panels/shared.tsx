/**
 * Shared building blocks for MD 2.0 Operation Panels.
 *
 * A panel is the non-blocking replacement for a v1 modal dialog: it lives in
 * the Inspector zone while the viewport stays visible and orbitable, keeps its
 * own draft state, forecasts the result on every keystroke via the registry's
 * `predict`, and commits exactly one operation on Apply.
 *
 * Everything here is presentation + draft bookkeeping; no crystallography.
 * The class names are plain strings (see the block comment in ./index.tsx);
 * the stylesheet is authored separately.
 */
import type Material from "@mat3ra/made/dist/js/Material";
import React, { useCallback, useMemo, useState } from "react";

import { digestOf, predict } from "../../core/registry";
import type { ResultDigest } from "../../core/types";

/** Which machinery runs an operation; rendered as the md2-badge. */
export type PanelEngine = "native" | "notebook" | "code";

export interface OperationPanelProps {
    material: Material;
    onApply: (type: string, params: unknown) => void;
    onCancel: () => void;
    /**
     * Pre-fills the form, overriding last-used recall. Set when re-opening the
     * panel to edit a step that is already in the timeline.
     */
    initialParams?: unknown;
    /** Replaces the Apply label, e.g. "Apply & replay 3 steps". */
    applyLabel?: string;
}

/**
 * Title + glyph for every operation that has a panel. Single source for the
 * panel head, the PANELS map and the Catalog's native cards; the titles mirror
 * the registry's `title` so a chip and its panel never disagree.
 */
export const PANEL_META = {
    supercell: { title: "Supercell", icon: "▦" },
    surface: { title: "Slab / Surface", icon: "▤" },
    "boundary-conditions": { title: "Boundary conditions", icon: "▣" },
} as const;

/** Above this the viewport preview degrades to a cell outline + counts. */
export const PREVIEW_ATOM_LIMIT = 2000;
/** Hard refusal: the forecast exists precisely so a 20x20x20 is never built. */
export const MAX_PREDICTED_ATOMS = 100000;

// --------------------------------------------------------------- parameters

/** Parse a raw field value. Returns null for empty / non-numeric input. */
export function parseNumber(raw: string): number | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const value = Number(trimmed);
    return Number.isFinite(value) ? value : null;
}

export function isWholeNumber(value: number): boolean {
    return Math.abs(value - Math.round(value)) < 1e-9;
}

/** 3 decimals, trailing zeros trimmed: 11.6018 -> "11.602", 3 -> "3". */
export function formatNumber(value: number | undefined, digits = 3): string {
    if (typeof value !== "number" || !Number.isFinite(value)) return "—";
    return String(Number(value.toFixed(digits)));
}

/** Thousands separators without depending on the host locale. */
export function formatCount(value: number): string {
    return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ------------------------------------------------------------ last used ----

interface Recalled {
    params: unknown;
    /** One-line summary shown next to the section title ("3x3x1"). */
    summary: string;
}

/**
 * v1 dialogs always reopened at their constructor defaults. Panels recall the
 * parameters last applied in this session instead, and say so. Deliberately
 * module-level and not persisted: session persistence belongs to state/persist.
 */
const lastUsed: Record<string, Recalled> = {};

export function rememberLastUsed(type: string, params: unknown, summary: string): void {
    lastUsed[type] = { params, summary };
}

export function recallLastUsed<P>(type: string): { params: P; summary: string } | undefined {
    const entry = lastUsed[type];
    return entry ? { params: entry.params as P, summary: entry.summary } : undefined;
}

// ------------------------------------------------------------- prediction --

export interface Forecast {
    /** The active material as it stands now. */
    before: ResultDigest;
    /** What the registry forecasts, when the parameters are usable. */
    after?: Partial<ResultDigest>;
    /** Validation message or engine error; set exactly when `ok` is false. */
    error?: string;
    /** Whether Apply may be enabled. */
    ok: boolean;
}

/**
 * Forecast an operation without committing it.
 *
 * `params` is null when the draft cannot be turned into parameters at all, and
 * `invalidReason` carries a panel-level rule (v1's det != 0, Miller indices not
 * all zero, ...) that must be reported before the engine is asked.
 */
export function useForecast(
    material: Material,
    type: string,
    params: unknown | null,
    invalidReason?: string | null,
): Forecast {
    const key = params === null ? "" : JSON.stringify(params);
    return useMemo<Forecast>(() => {
        const before = digestOf(material);
        if (invalidReason) return { before, error: invalidReason, ok: false };
        if (params === null) return { before, error: "Fill in every field.", ok: false };
        let result: Partial<ResultDigest> & { error?: string };
        try {
            result = predict(material, type, params);
        } catch (e) {
            result = { error: e instanceof Error ? e.message : String(e) };
        }
        if (result.error) return { before, error: result.error, ok: false };
        const after: Partial<ResultDigest> = {
            formula: result.formula,
            atomCount: result.atomCount,
            latticeType: result.latticeType,
            a: result.a,
            b: result.b,
            c: result.c,
        };
        if (typeof after.atomCount === "number" && after.atomCount > MAX_PREDICTED_ATOMS) {
            return {
                before,
                after,
                error: `Refused: ${formatCount(after.atomCount)} atoms exceeds the ${formatCount(
                    MAX_PREDICTED_ATOMS,
                )}-atom limit.`,
                ok: false,
            };
        }
        return { before, after, ok: true };
        // `key` stands in for `params`: a fresh object on every keystroke
        // would otherwise re-run the forecast on every render.
    }, [material, type, key, invalidReason]);
}

// ------------------------------------------------------------------- chrome

/** Stable ids so <label for> works even if two panels are ever mounted at once. */
let idCounter = 0;
export function useFieldIds(prefix: string): (name: string) => string {
    const [base] = useState(() => {
        idCounter += 1;
        return `md2-${prefix}-${idCounter}`;
    });
    return useCallback((name: string) => `${base}-${name}`, [base]);
}

export function PanelFrame(props: {
    icon: string;
    title: string;
    /** Shown as the engine badge; every MVP panel is native. */
    engine?: PanelEngine;
    canApply: boolean;
    applyLabel?: string;
    onApply: () => void;
    onCancel: () => void;
    children: React.ReactNode;
}): JSX.Element {
    const {
        icon,
        title,
        engine = "native",
        canApply,
        applyLabel,
        onApply,
        onCancel,
        children,
    } = props;
    // Esc, Cmd-Z and the other chords are global (shell-owned), so a panel binds
    // no keys of its own; it only labels its region.
    return (
        <section className="md2-panel" aria-label={`${title} operation panel`}>
            <header className="md2-panel-head">
                <span className="md2-icon" aria-hidden="true">
                    {icon}
                </span>
                <h2 className="md2-panel-title">{title}</h2>
                <span className="md2-badge" data-engine={engine}>
                    {engine.toUpperCase()}
                </span>
            </header>
            <div className="md2-panel-body">{children}</div>
            <div className="md2-actions">
                <button type="button" className="md2-btn" onClick={onCancel}>
                    Cancel
                </button>
                <button
                    type="button"
                    className="md2-btn md2-btn-primary"
                    disabled={!canApply}
                    onClick={onApply}
                >
                    {applyLabel || "Apply — adds 1 step"}
                </button>
            </div>
        </section>
    );
}

export function Section(props: {
    title: string;
    /** Right-aligned recall hint ("last used: 3x3x1" / "default: identity"). */
    hint?: string;
    /** When given the hint becomes a button that restores those parameters. */
    onRecall?: () => void;
    children: React.ReactNode;
}): JSX.Element {
    const { title, hint, onRecall, children } = props;
    return (
        <div className="md2-section">
            <div className="md2-section-title">
                <span>{title}</span>
                {hint && onRecall ? (
                    <button
                        type="button"
                        className="md2-hint"
                        onClick={onRecall}
                        title="Restore these parameters"
                    >
                        {hint}
                    </button>
                ) : null}
                {hint && !onRecall ? <span className="md2-hint">{hint}</span> : null}
            </div>
            {children}
        </div>
    );
}

export function NumberField(props: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    /** Rendered after the input, e.g. "Å". */
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
}): JSX.Element {
    const { id, label, value, onChange, unit, min, max, step } = props;
    return (
        <div className="md2-field-row">
            <label htmlFor={id}>
                {label}
                {unit ? <span className="md2-unit">{unit}</span> : null}
            </label>
            <input
                id={id}
                className="md2-field"
                type="number"
                inputMode="decimal"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}

/** The PREDICTED RESULT line: "8 -> 72 atoms - 1 material", or the error. */
export function PredictedResult({ forecast }: { forecast: Forecast }): JSX.Element {
    const { before, after, error } = forecast;
    if (error) {
        return (
            <div className="md2-predict md2-predict-error" aria-live="polite">
                {`⚠ ${error}`}
            </div>
        );
    }
    const atomCount = after?.atomCount;
    const lattice: string[] = [];
    (["a", "b", "c"] as const).forEach((axis) => {
        const next = after?.[axis];
        const previous = before[axis];
        if (typeof next !== "number" || typeof previous !== "number") return;
        if (Math.abs(next - previous) < 1e-4) return;
        lattice.push(`${axis}: ${formatNumber(previous)} → ${formatNumber(next)} Å`);
    });
    const formulaChanged = after?.formula && after.formula !== before.formula;
    return (
        <div className="md2-predict" aria-live="polite">
            <div>
                {typeof atomCount === "number"
                    ? `${formatCount(before.atomCount)} → ${formatCount(
                          atomCount,
                      )} atoms · 1 material`
                    : `${formatCount(before.atomCount)} atoms · 1 material · count unchanged`}
            </div>
            {formulaChanged ? <div>{`${before.formula} → ${after?.formula}`}</div> : null}
            {lattice.length ? <div>{lattice.join(" · ")}</div> : null}
        </div>
    );
}

/** Honest warning once a result is too big to draw as ghost atoms. */
export function PreviewNote({ forecast }: { forecast: Forecast }): JSX.Element | null {
    const atomCount = forecast.after?.atomCount;
    if (!forecast.ok || typeof atomCount !== "number" || atomCount <= PREVIEW_ATOM_LIMIT) {
        return null;
    }
    return (
        <p className="md2-note md2-note-warn">
            {`Above ~${formatCount(
                PREVIEW_ATOM_LIMIT,
            )} atoms the viewport preview degrades to a cell outline and counts.`}
        </p>
    );
}
