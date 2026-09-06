/**
 * Interpolated set (NEB): the images between two structures.
 *
 * v1 could only interpolate between material *i* and *i+1* — whatever happened to sit next to the
 * current one in the list. Here both endpoints are chosen, because which two structures a reaction
 * path runs between has nothing to do with the order they were added in.
 *
 * The result is a set: one folder row, one undoable step, children with their own histories.
 */
import { Made } from "@mat3ra/made";
import type Material from "@mat3ra/made/dist/js/Material";
import React, { useMemo, useState } from "react";

import { resolve } from "../../core/replay";
import type { MaterialDoc, ResultDigest } from "../../core/types";
import { NumberField, PanelFrame, Section } from "./shared";

export interface InterpolatedSetPanelProps {
    material: Material;
    digest: ResultDigest;
    /** Every material in the session, so either endpoint can be any of them. */
    docs: MaterialDoc[];
    activeId: string;
    onApply: (params: { finalId: string; count: number }, children: ChildConfig[]) => void;
    onCancel: () => void;
    applyLabel?: string;
}

export interface ChildConfig {
    config: unknown;
    label: string;
}

/** Images between the two endpoints, named so the order is readable in the list. */
export function interpolate(initial: Material, final: Material, count: number): ChildConfig[] {
    // made.js exposes this as a constructor that returns an array of bases; the cast is what
    // v1 did too (`new Made.tools.basis.interpolate(...)` with an eslint exemption).
    const tools = Made.tools.basis as unknown as {
        interpolate: new (a: unknown, b: unknown, n: number) => {
            toJSON: () => unknown;
            formula: string;
        }[];
    };
    // eslint-disable-next-line new-cap
    const bases = new tools.interpolate(
        (initial as unknown as { getBasis: () => unknown }).getBasis(),
        (final as unknown as { getBasis: () => unknown }).getBasis(),
        count,
    );

    return bases.map((basis, index) => ({
        config: {
            ...(initial.toJSON() as object),
            basis: basis.toJSON(),
            name: `${index} - ${initial.name} - ${basis.formula}`,
        },
        label: `image ${index}`,
    }));
}

export function InterpolatedSetPanel({
    material,
    digest,
    docs,
    activeId,
    onApply,
    onCancel,
    applyLabel,
}: InterpolatedSetPanelProps) {
    const others = docs
        .filter((doc) => doc.id !== activeId)
        .map((doc) => ({ doc, resolved: resolve(doc).material }));
    /*
     * Open on an endpoint that can actually work.
     *
     * Interpolation needs both structures in the same cell, so defaulting to whichever material
     * happens to be first usually opens the panel onto an error. Comparing cells is only a
     * heuristic — the attempt in `preview` is the real check — but it is enough to pick a sensible
     * starting selection, and the most recently added match is the likeliest intended partner.
     */
    const [finalId, setFinalId] = useState(() => {
        const cellOf = (m: Material) =>
            JSON.stringify((m.basis as unknown as { cell?: unknown })?.cell ?? null);
        const source = cellOf(material);
        const compatible = others.filter(({ resolved }) => cellOf(resolved) === source);
        const pick = compatible.length ? compatible[compatible.length - 1] : others[0];
        return pick?.doc.id ?? "";
    });
    const [count, setCount] = useState("5");

    const images = Number(count);
    const wellFormed = Boolean(finalId) && Number.isInteger(images) && images > 0 && images <= 50;

    /*
     * The forecast is the operation, run.
     *
     * made.js refuses to interpolate between bases whose cells differ — rightly, since images along
     * a path have to live in the same cell to mean anything — and there is no cheap structural test
     * that predicts it reliably. Doing the work here is both the check and the preview: Apply is
     * enabled only when the images already exist, and the failure is a sentence in the panel rather
     * than an uncaught error after the click.
     */
    const preview = useMemo(() => {
        if (!wellFormed)
            return {
                ok: false as const,
                error: "Pick a second material and between 1 and 50 images",
            };
        const final = others.find(({ doc }) => doc.id === finalId);
        if (!final) return { ok: false as const, error: "Pick a material to interpolate towards" };
        try {
            return { ok: true as const, children: interpolate(material, final.resolved, images) };
        } catch (e) {
            return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
        }
    }, [wellFormed, finalId, images, material, others]);

    const valid = preview.ok;

    return (
        <PanelFrame
            title="Interpolated set (NEB)"
            icon="⋯"
            engine="native"
            canApply={valid}
            applyLabel={applyLabel}
            onCancel={onCancel}
            onApply={() => {
                const final = docs.find((doc) => doc.id === finalId);
                if (!final) return;
                onApply(
                    { finalId, count: images },
                    interpolate(material, resolve(final).material, images),
                );
            }}
        >
            <Section title="Endpoints">
                <div className="md2-frow">
                    <span className="md2-flabel">From</span>
                    <span className="md2-fvalue">{material.name || "the active material"}</span>
                </div>
                <label className="md2-frow" htmlFor="neb-final">
                    <span className="md2-flabel">To</span>
                    <select
                        id="neb-final"
                        value={finalId}
                        onChange={(event) => setFinalId(event.target.value)}
                    >
                        {others.map(({ doc, resolved }) => (
                            <option key={doc.id} value={doc.id}>
                                {resolved.name || "Untitled"}
                            </option>
                        ))}
                    </select>
                </label>
                {!others.length && (
                    <div className="md2-note">
                        No other material shares this cell. Images along a path have to live in the
                        same cell, so interpolation needs a second structure built on this one — a
                        copy with atoms moved, for instance.
                    </div>
                )}
            </Section>

            <Section title="Images">
                <NumberField
                    id="neb-count"
                    label="count"
                    value={count}
                    onChange={setCount}
                    unit={`image${images === 1 ? "" : "s"}`}
                />
            </Section>

            {preview.ok ? (
                <div className="md2-predict">
                    → {images} material{images === 1 ? "" : "s"} (one set)
                </div>
            ) : (
                <div className="md2-predict md2-predict-error">{preview.error}</div>
            )}
        </PanelFrame>
    );
}
