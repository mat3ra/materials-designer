/**
 * Console › Notebook — JupyterLite, bound to the session.
 *
 * v1 put this behind Advanced › JupyterLite Transformation, in a modal that covered the app: you
 * could not see the material you were transforming while you transformed it. Here it is a console
 * tab, so the notebook, the 3D view and the timeline are all on screen at once.
 *
 * Three things about the shape are load-bearing rather than aesthetic, and all three come from the
 * 53 generated health-check features:
 *
 *  - the DOM ids and `data-tid`s are v1's, so `JupyterLiteTransformationDialogWidget` and
 *    `JupyterLiteSession` drive this surface unchanged;
 *  - the iframe is mounted only while the tab is showing, so re-opening the notebook gives a fresh
 *    session at `Introduction.ipynb` — the templates open it three times in one scenario and
 *    assert that file each time;
 *  - "Add to session" closes the console, which is what made v1's re-opens work.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_NOTEBOOK_PATH, JUPYTERLITE_ORIGIN_URL } from "../../config";
import { type BridgedIframeHandle, BridgedIframe } from "../../kit/BridgedIframe";
import { type NamedItem, MaterialsSelector } from "./MaterialsSelector";
import { type MaterialConfig, fromFramePayload, toFramePayload } from "./payload";

export const NOTEBOOK_IFRAME_ID = "jupyter-lite-iframe";

/** A material the session holds, as the notebook needs to see it. */
export interface NotebookInput extends NamedItem {
    config: MaterialConfig;
}

/** A structure the notebook produced, staged until the user adopts it. */
export interface NotebookOutput extends NamedItem {
    config: MaterialConfig;
}

export interface NotebookTabProps {
    inputs: NotebookInput[];
    /** Preselected when the tab opens — the material the rest of the app is showing. */
    activeId?: string;
    /**
     * Adopt the staged outputs into the session, with the inputs that produced them and the
     * notebook the session was opened at — reported rather than assumed, so provenance cannot
     * drift from what this surface actually loaded.
     */
    onAdd: (outputs: NotebookOutput[], inputs: NotebookInput[], notebookPath: string) => void;
    onError: (message: string) => void;
    notebookPath?: string;
}

export function NotebookTab({
    inputs,
    activeId,
    onAdd,
    onError,
    notebookPath = DEFAULT_NOTEBOOK_PATH,
}: NotebookTabProps) {
    const frame = useRef<BridgedIframeHandle>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>(() =>
        activeId ? [activeId] : inputs.slice(0, 1).map((one) => one.id),
    );
    const [outputs, setOutputs] = useState<NotebookOutput[]>([]);

    const selected = useMemo(
        () => selectedIds.map((id) => inputs.find((one) => one.id === id)).filter(Boolean),
        [selectedIds, inputs],
    ) as NotebookInput[];

    const payload = useMemo(() => toFramePayload(selected.map((one) => one.config)), [selected]);

    // The notebook reads `materials_in` when a cell asks for it, so what it gets has to track the
    // selection rather than a snapshot taken when the frame loaded.
    useEffect(() => {
        frame.current?.send(payload);
    }, [payload]);

    const handleRequestData = useCallback(() => payload, [payload]);

    const handleReceiveData = useCallback(
        (data: unknown) => {
            const { configs, errors } = fromFramePayload(data);
            // One notice, not one per failure: they replace each other otherwise, and the user
            // ends up seeing whichever structure happened to be last in the list.
            if (errors.length) onError(errors.join(" "));
            if (!configs) return;
            setOutputs(
                configs.map((config, index) => ({
                    // The notebook re-sends its whole output set on every run, so ids are derived
                    // from the run rather than kept: a re-run replaces the staging list instead of
                    // appending a second copy of everything.
                    id: `out-${index}`,
                    name: (config.name as string) || `Material ${index + 1}`,
                    config,
                })),
            );
        },
        [onError],
    );

    const handleSelect = useCallback((next: NotebookInput[]) => {
        setSelectedIds(next.map((one) => one.id));
    }, []);

    const src = `${JUPYTERLITE_ORIGIN_URL}/lab/tree?path=${notebookPath}`;

    return (
        <div className="md2-notebook" id="jupyterlite-transformation-dialog">
            <div className="md2-notebook-row">
                <span className="md2-notebook-label">
                    Input materials (<code>materials_in</code>)
                </span>
                <div className="md2-notebook-field">
                    <MaterialsSelector
                        items={inputs}
                        selected={selected}
                        onChange={handleSelect}
                        testId="materials-in-selector"
                        label="Selected"
                        placeholder={selected.length ? undefined : "Pick materials to send"}
                    />
                </div>
            </div>

            <div className="md2-notebook-frame">
                <BridgedIframe
                    ref={frame}
                    id={NOTEBOOK_IFRAME_ID}
                    src={src}
                    origin={JUPYTERLITE_ORIGIN_URL}
                    title="JupyterLite"
                    onRequestData={handleRequestData}
                    onReceiveData={handleReceiveData}
                />
            </div>

            <div className="md2-notebook-row">
                <span className="md2-notebook-label">
                    Output materials (<code>materials_out</code>)
                </span>
                <div className="md2-notebook-field">
                    <MaterialsSelector
                        items={outputs}
                        selected={outputs}
                        onChange={setOutputs}
                        testId="materials-out-selector"
                        label="Produced"
                        placeholder={outputs.length ? undefined : "Nothing produced yet"}
                    />
                </div>
                <button
                    type="button"
                    className="md2-btn md2-btn-primary"
                    id="jupyterlite-transformation-dialog-submit-button"
                    disabled={outputs.length === 0}
                    title={
                        outputs.length === 0
                            ? "Run a notebook cell that writes to materials_out"
                            : undefined
                    }
                    onClick={() => onAdd(outputs, selected, notebookPath)}
                >
                    Add to session
                </button>
            </div>
        </div>
    );
}
