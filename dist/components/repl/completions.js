import { shortenQualifiedNames } from "./pyFormat";
/** Map Jedi's completion `type` to a CodeMirror completion type (drives the popup icon). */
const JEDI_TYPE_TO_CM = {
    module: "namespace",
    class: "class",
    instance: "variable",
    function: "function",
    method: "method",
    property: "property",
    param: "property",
    path: "text",
    keyword: "keyword",
    statement: "variable",
};
export function jediTypeToCm(type) {
    var _a;
    return (_a = JEDI_TYPE_TO_CM[type]) !== null && _a !== void 0 ? _a : "variable";
}
/**
 * Build the info-popup DOM for a highlighted completion: the signature in a wrapped monospace block,
 * the docstring as readable prose below it. Returns null when there's nothing to show. Rendering as a
 * bounded DOM node (rather than a raw string) is what makes long typed signatures legible.
 */
export function buildInfoNode(desc) {
    if (!desc || (!desc.signature && !desc.docstring))
        return null;
    const root = document.createElement("div");
    root.style.maxWidth = "460px";
    root.style.maxHeight = "320px";
    root.style.overflow = "auto";
    if (desc.signature) {
        const sig = document.createElement("div");
        sig.textContent = shortenQualifiedNames(desc.signature);
        sig.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, monospace";
        sig.style.fontSize = "0.85em";
        sig.style.whiteSpace = "pre-wrap";
        sig.style.wordBreak = "break-word";
        if (desc.docstring) {
            sig.style.marginBottom = "6px";
            sig.style.paddingBottom = "6px";
            sig.style.borderBottom = "1px solid rgba(128,128,128,0.3)";
        }
        root.appendChild(sig);
    }
    if (desc.docstring) {
        const doc = document.createElement("div");
        doc.textContent = desc.docstring;
        doc.style.whiteSpace = "pre-wrap";
        root.appendChild(doc);
    }
    return root;
}
/**
 * A CodeMirror 6 completion source backed by Jedi (via {@link CompletionBackend}). It completes at the
 * cursor against the live namespace, so it offers the user's variables and attributes as well as the
 * pre-imported helpers — and defers signature/docstring to an on-demand `info` callback so typing
 * stays responsive.
 */
export function makeReplCompletionSource(backend) {
    return (context) => {
        if (!backend.isInitialized)
            return null;
        const fragment = context.matchBefore(/\w*/);
        if (!fragment)
            return null;
        // Suppress the popup on an empty prefix unless the char before is `.` (attribute access) or
        // the user explicitly asked (Ctrl+Space).
        const prevChar = fragment.from > 0
            ? context.state.doc.sliceString(fragment.from - 1, fragment.from)
            : "";
        if (fragment.from === fragment.to && prevChar !== "." && !context.explicit)
            return null;
        const source = context.state.doc.toString();
        const lineInfo = context.state.doc.lineAt(context.pos);
        const line = lineInfo.number; // Jedi lines are 1-based
        const column = context.pos - lineInfo.from; // columns 0-based
        let completions;
        try {
            completions = backend.complete(source, line, column);
        }
        catch (_a) {
            return null;
        }
        if (!completions.length)
            return null;
        const options = completions.map((c) => {
            const isParam = c.type === "param";
            return {
                label: c.name,
                type: jediTypeToCm(c.type),
                detail: c.type,
                // Rank the current call's keyword args above everything else, and complete them as
                // `name=` so the user lands ready to type the value (IDE-style).
                boost: isParam ? 99 : 0,
                apply: isParam ? `${c.name}=` : undefined,
                info: () => buildInfoNode(backend.describe(source, line, column, c.name)),
            };
        });
        return { from: fragment.from, options, validFor: /^\w*$/ };
    };
}
