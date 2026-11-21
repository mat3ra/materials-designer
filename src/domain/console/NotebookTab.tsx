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
 *
 * The bridge itself is `useMaterialsBridge`, shared with the REPL tab.
 */
import React from "react";

import { DEFAULT_NOTEBOOK_PATH, JUPYTERLITE_ORIGIN_URL } from "../../config";
import { BridgedIframe } from "../../kit/BridgedIframe";
import { MaterialsSelector } from "./MaterialsSelector";
import { type AdoptOutputs, type NotebookInput, useMaterialsBridge } from "./useMaterialsBridge";

export type {
    AdoptOutputs,
    CodeSurface,
    NotebookInput,
    NotebookOutput,
} from "./useMaterialsBridge";

export const NOTEBOOK_IFRAME_ID = "jupyter-lite-iframe";

export interface NotebookTabProps {
    inputs: NotebookInput[];
    /** Preselected when the tab opens — the material the rest of the app is showing. */
    activeId?: string;
    /**
     * Adopt the staged outputs into the session, with the inputs that produced them and the
     * notebook the session was opened at — reported rather than assumed, so provenance cannot
     * drift from what this surface actually loaded.
     */
    onAdd: AdoptOutputs;
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
    const bridge = useMaterialsBridge({ inputs, activeId, onError });
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
                        selected={bridge.selected}
                        onChange={bridge.onSelect}
                        testId="materials-in-selector"
                        label="Selected"
                        placeholder={bridge.selected.length ? undefined : "Pick materials to send"}
                    />
                </div>
            </div>

            <div className="md2-notebook-frame">
                <BridgedIframe
                    ref={bridge.frame}
                    id={NOTEBOOK_IFRAME_ID}
                    src={src}
                    origin={JUPYTERLITE_ORIGIN_URL}
                    title="JupyterLite"
                    onRequestData={bridge.handleRequestData}
                    onReceiveData={bridge.handleReceiveData}
                />
            </div>

            <div className="md2-notebook-row">
                <span className="md2-notebook-label">
                    Output materials (<code>materials_out</code>)
                </span>
                <div className="md2-notebook-field">
                    <MaterialsSelector
                        items={bridge.outputs}
                        selected={bridge.outputs}
                        onChange={bridge.setOutputs}
                        testId="materials-out-selector"
                        label="Produced"
                        placeholder={bridge.outputs.length ? undefined : "Nothing produced yet"}
                    />
                </div>
                <button
                    type="button"
                    className="md2-btn md2-btn-primary"
                    id="jupyterlite-transformation-dialog-submit-button"
                    data-testid="console-add-to-session"
                    disabled={bridge.outputs.length === 0}
                    title={
                        bridge.outputs.length === 0
                            ? "Run a notebook cell that writes to materials_out"
                            : undefined
                    }
                    onClick={() =>
                        onAdd(bridge.outputs, bridge.selected, {
                            surface: "notebook",
                            entryPath: notebookPath,
                        })
                    }
                >
                    Add to session
                </button>
            </div>
        </div>
    );
}
