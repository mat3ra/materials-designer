/**
 * Console › REPL — a Python console in the dock, bound to the session.
 *
 * JupyterLite's own `/repl/` app through `BridgedIframe`, over the same materials bridge as the
 * Notebook tab. The deployment's `data_bridge` extension is federated at the root and the REPL app
 * inherits it, so `get_materials` / `set_materials` from `mat3ra.notebooks_utils` work at this
 * prompt exactly as they do in a notebook cell. The host side was already answering the frame's
 * requests; until now this tab simply was not asking.
 *
 * The end state is still cove's `PythonRepl` mounted in-page over `InPageTransport` (its unmerged
 * `feature/SOF-7961`): no iframe, no postMessage hop, and the selection shared by a direct call
 * rather than a message. This is that surface with a frame in the middle.
 */
import React from "react";

import { JUPYTERLITE_ORIGIN_URL } from "../../config";
import { BridgedIframe } from "../../kit/BridgedIframe";
import { MaterialsSelector } from "./MaterialsSelector";
import { type AdoptOutputs, type NotebookInput, useMaterialsBridge } from "./useMaterialsBridge";

export const REPL_IFRAME_ID = "python-repl-iframe";

/** `kernel` picks the interpreter; `toolbar` gives the run and restart controls. */
export const REPL_URL = `${JUPYTERLITE_ORIGIN_URL}/repl/index.html?kernel=python&toolbar=1`;

/** The lines a notebook runs to reach the bridge, in the order the notebooks run them. */
export const REPL_RECIPE = [
    'from mat3ra.notebooks_utils.packages import install_packages; await install_packages("made")',
    "from mat3ra.notebooks_utils.material import get_materials, set_materials",
    "materials = get_materials(globals())   # the selection above, as materials_in",
    "set_materials(materials)               # stages them above for Add to session",
].join("\n");

export interface ReplTabProps {
    inputs: NotebookInput[];
    activeId?: string;
    onAdd: AdoptOutputs;
    onError: (message: string) => void;
}

export function ReplTab({ inputs, activeId, onAdd, onError }: ReplTabProps) {
    const bridge = useMaterialsBridge({ inputs, activeId, onError });

    return (
        <div className="md2-notebook md2-repl" id="python-repl">
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
                    id={REPL_IFRAME_ID}
                    src={REPL_URL}
                    origin={JUPYTERLITE_ORIGIN_URL}
                    title="Python REPL"
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
                    data-testid="console-add-to-session"
                    disabled={bridge.outputs.length === 0}
                    title={
                        bridge.outputs.length === 0
                            ? "Call set_materials(...) at the prompt first"
                            : undefined
                    }
                    onClick={() => onAdd(bridge.outputs, bridge.selected, { surface: "repl" })}
                >
                    Add to session
                </button>
            </div>

            <div className="md2-note" data-testid="repl-note">
                The same bridge the notebooks use. At the prompt:
                <pre className="md2-repl-recipe">{REPL_RECIPE}</pre>
            </div>
        </div>
    );
}
