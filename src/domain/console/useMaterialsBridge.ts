/**
 * The session's side of the materials bridge, shared by every code surface in the dock.
 *
 * A frame asks for `materials_in` and posts `materials_out`; the host answers the first from the
 * current selection and stages the second until the user adopts it. The Notebook and the REPL
 * differ only in which JupyterLite app the frame loads, so this state lives here once rather than
 * in each tab — and the guarantees the notebook specs pin (the selection tracked live, a re-run
 * replacing the staged list, one notice per run) hold for both by construction.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { BridgedIframeHandle } from "../../kit/BridgedIframe";
import type { NamedItem } from "./MaterialsSelector";
import { type MaterialConfig, fromFramePayload, toFramePayload } from "./payload";

/** A material the session holds, as a code surface needs to see it. */
export interface NotebookInput extends NamedItem {
    config: MaterialConfig;
}

/** A structure a code surface produced, staged until the user adopts it. */
export interface NotebookOutput extends NamedItem {
    config: MaterialConfig;
}

/**
 * Which code surface produced a result, and — for the notebook — the file it was opened at.
 *
 * Named rather than inferred: the REPL has no path, and encoding "it was the REPL" as a fake one
 * would put a sentinel in the operation log where a real path is recorded, and make every consumer
 * compare strings to find out who called.
 */
export type CodeSurface = { surface: "notebook"; entryPath: string } | { surface: "repl" };

/** Adopt staged outputs into the session, with the inputs and the surface that produced them. */
export type AdoptOutputs = (
    outputs: NotebookOutput[],
    inputs: NotebookInput[],
    from: CodeSurface,
) => void;

export interface MaterialsBridgeOptions {
    inputs: NotebookInput[];
    /** Preselected when the tab opens — the material the rest of the app is showing. */
    activeId?: string;
    onError: (message: string) => void;
}

export function useMaterialsBridge({ inputs, activeId, onError }: MaterialsBridgeOptions) {
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

    // The frame reads `materials_in` when a cell asks for it, so what it gets has to track the
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
                    // The frame re-sends its whole output set on every run, so ids are derived
                    // from the run rather than kept: a re-run replaces the staging list instead
                    // of appending a second copy of everything.
                    id: `out-${index}`,
                    name: (config.name as string) || `Material ${index + 1}`,
                    config,
                })),
            );
        },
        [onError],
    );

    const onSelect = useCallback((next: NotebookInput[]) => {
        setSelectedIds(next.map((one) => one.id));
    }, []);

    return { frame, selected, onSelect, outputs, setOutputs, handleRequestData, handleReceiveData };
}
