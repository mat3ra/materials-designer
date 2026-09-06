/**
 * Console › REPL — a Python console in the dock.
 *
 * The end state for this tab is cove's `PythonRepl` mounted in-page over `InPageTransport`: no
 * iframe, no postMessage hop, and the selection shared directly. That component exists, on cove's
 * unmerged `feature/SOF-7961`; the published package carries only `PyodideLoader`. So this is the
 * fallback the plan wrote down — the same surface pointed at JupyterLite's own REPL app, which is
 * deployed alongside the notebooks and needs no new code.
 *
 * What it deliberately does *not* do is bind `materials_in` / `materials_out`. The notebook tab
 * does, over a bridge whose behaviour in the REPL app is not something this repository can verify.
 * A selector that silently never fills is worse than an absent one, so the binding waits for the
 * in-page REPL, where it is a direct call rather than a message.
 */
import React from "react";

import { JUPYTERLITE_ORIGIN_URL } from "../../config";
import { BridgedIframe } from "../../kit/BridgedIframe";

export const REPL_IFRAME_ID = "python-repl-iframe";

/** `kernel` picks the interpreter; `toolbar` gives the run and restart controls. */
export const REPL_URL = `${JUPYTERLITE_ORIGIN_URL}/repl/index.html?kernel=python&toolbar=1`;

export function ReplTab() {
    return (
        <div className="md2-repl" id="python-repl">
            <div className="md2-notebook-frame">
                <BridgedIframe
                    id={REPL_IFRAME_ID}
                    src={REPL_URL}
                    origin={JUPYTERLITE_ORIGIN_URL}
                    title="Python REPL"
                />
            </div>
            <p className="md2-note" data-testid="repl-note">
                Python with the mat3ra packages available. Passing the session&rsquo;s materials in
                and out arrives with the in-page REPL; until then, use the Notebook tab for work
                that needs <code>materials_in</code>.
            </p>
        </div>
    );
}
