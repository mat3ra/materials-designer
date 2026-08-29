/* eslint-disable react/jsx-props-no-spreading */
import { AlertProvider } from "@mat3ra/cove/dist/theme/provider";
import type { MaterialSchema, Matrix3X3Schema } from "@mat3ra/esse/dist/js/types";
import type { ViewSettingsFromUrl } from "@mat3ra/wave.js/dist/utils/viewSettingsUrl";
import React, { useCallback, useEffect, useState } from "react";

import MaterialsDesignerComponent from "./MaterialsDesigner";
import { MDMaterial } from "./MDMaterial";
import {
    type ExportFormat,
    materialsAdd,
    materialsExport,
    materialsInsertAt,
    materialsRemove,
} from "./reducers/InputOutput";
import {
    type BoundaryConditions,
    type MDState,
    type SurfaceConfig,
    materialsCloneOne,
    materialsGenerateSupercellForOne,
    materialsGenerateSurfaceForOne,
    materialsSetBoundaryConditionsForOne,
    materialsToggleIsNonPeriodicForOne,
    materialsUpdateIndex,
    materialsUpdateNameForOne,
    materialsUpdateOne,
    stampOriginalSignature,
} from "./reducers/Material";

// Extend Window interface to include MDState
declare global {
    interface Window {
        MDState: MDState;
    }
}

function useUndoableState<T extends MDState>(initialValue: T, maxPastSize = 50) {
    /**
     * Past and future are one piece of state on purpose. Held separately, moving through history
     * takes two setters, and outside React's batching (a keyboard shortcut is a native listener)
     * each one renders on its own. The render in between carries a `redo` that still closes over
     * the empty future, and `MaterialsDesigner.shouldComponentUpdate` compares props with
     * JSON.stringify - which drops functions - so the corrected callback never reaches the toolbar.
     * One setter, one render, one consistent pair of callbacks.
     */
    const [history, setHistory] = useState<{ past: T[]; future: T[] }>({ past: [], future: [] });
    const presentRef = React.useRef<T>(initialValue);

    window.MDState = presentRef.current;

    const setState = useCallback(
        (newValue: T, { recordHistory = true }: { recordHistory?: boolean } = {}) => {
            // Read the outgoing state before moving the ref: the updater below runs during the
            // next render, by which point `presentRef.current` is already `newValue`, and the
            // history would fill with copies of the new state.
            const previous = presentRef.current;
            presentRef.current = newValue;
            if (!recordHistory) {
                // Still a state change, so still a render - just not one the user can undo.
                setHistory((history_) => ({ ...history_ }));
                return;
            }
            setHistory(({ past }) => ({
                // Keep only the most recent maxPastSize entries
                past: [...past, previous].slice(-maxPastSize),
                future: [], // a new change invalidates the redo history
            }));
        },
        [maxPastSize],
    );

    // The present is a ref, so it moves before the setter runs: an unbatched render that happened
    // first would publish the outgoing state.
    const undo = useCallback(() => {
        if (history.past.length === 0) return;
        const previous = presentRef.current;
        presentRef.current = history.past[history.past.length - 1];
        setHistory(({ past, future }) => ({
            past: past.slice(0, -1),
            future: [previous, ...future],
        }));
    }, [history]);

    const redo = useCallback(() => {
        if (history.future.length === 0) return;
        const previous = presentRef.current;
        const [next] = history.future;
        presentRef.current = next;
        setHistory(({ past, future }) => ({
            past: [...past, previous],
            future: future.slice(1),
        }));
    }, [history]);

    const reset = useCallback(() => {
        presentRef.current = initialValue;
        setHistory({ past: [], future: [] });
    }, []);

    const canUndo = history.past.length > 0;
    const canRedo = history.future.length > 0;

    return [presentRef, setState, undo, redo, reset, canUndo, canRedo] as [
        React.MutableRefObject<T>,
        typeof setState,
        typeof undo,
        typeof redo,
        typeof reset,
        boolean,
        boolean,
    ];
}

/** What HeaderMenuToolbar hands to a host-supplied `openImportModal`. */
export interface ImportModalProps {
    modalId: string;
    show: boolean;
    onSubmit: (materials: MDMaterial[]) => void;
    onClose?: () => void;
    defaultMaterialsSet: MaterialSchema[];
}

export interface MaterialsDesignerContainerProps {
    skipAlertProvider?: boolean;
    isLoading?: boolean;
    initialMaterials?: MDMaterial[];
    openImportModal?: (params: ImportModalProps) => void;
    closeImportModal?: () => void;
    openSaveActionDialog?: (state: MDState) => void;
    isConventionalCellShown?: boolean;
    maxCombinatorialBasesCount?: number;
    onExit?: () => void;
    initialViewSettings?: ViewSettingsFromUrl;
}

export function MaterialsDesignerContainer({
    initialMaterials = [new MDMaterial()],
    skipAlertProvider = false,
    isLoading = false,
    ...props
}: MaterialsDesignerContainerProps) {
    // Stamped once: the materials the session opens with are its baseline, so editing one and
    // returning it to this state clears the "updated" marker again. Re-stamping on every render
    // would also mean re-hashing every material on every render.
    const baselineMaterials = React.useMemo(() => initialMaterials.map(stampOriginalSignature), []);

    const [mdState, setMdState, undo, redo, reset, canUndo, canRedo] = useUndoableState<MDState>({
        index: 0,
        isLoading: false,
        materials: baselineMaterials,
        updatedIndices: [],
    });

    // Mirroring the loading flag is not an edit. Recorded as one, it would run on mount and leave
    // a phantom entry in the history: undo would light up before the user had done anything, and
    // the first Mod+Z would swap the state for an identical copy of itself.
    useEffect(() => {
        setMdState({ ...mdState.current, isLoading }, { recordHistory: false });
    }, [isLoading]);

    const onUpdate = useCallback((material: MDMaterial, index?: number) => {
        setMdState(materialsUpdateOne(mdState.current, { material, index }));
    }, []);

    const onNameUpdate = useCallback((name: string, index: number) => {
        setMdState(materialsUpdateNameForOne(mdState.current, { name, index }));
    }, []);

    // Which material you are looking at is navigation, not an edit. Recorded, clicking through
    // five materials would cost five presses of Mod+Z to get back to the last thing you changed.
    const onItemClick = useCallback((index: number) => {
        setMdState(materialsUpdateIndex(mdState.current, { index }), { recordHistory: false });
    }, []);

    const onClone = useCallback(() => {
        setMdState(materialsCloneOne(mdState.current));
    }, []);

    const onToggleIsNonPeriodic = useCallback(() => {
        setMdState(materialsToggleIsNonPeriodicForOne(mdState.current));
    }, []);

    const onGenerateSupercell = useCallback((matrix: Matrix3X3Schema) => {
        setMdState(materialsGenerateSupercellForOne(mdState.current, { matrix }));
    }, []);

    const onGenerateSurface = useCallback((config: SurfaceConfig) => {
        setMdState(materialsGenerateSurfaceForOne(mdState.current, config));
    }, []);

    const onSetBoundaryConditions = useCallback((config: BoundaryConditions) => {
        setMdState(materialsSetBoundaryConditionsForOne(mdState.current, config));
    }, []);

    const onAdd = useCallback((materials: MDMaterial | MDMaterial[], addAtIndex?: boolean) => {
        setMdState(materialsAdd(mdState.current, { materials, addAtIndex }));
    }, []);

    const onRemove = useCallback((index: number) => {
        setMdState(materialsRemove(mdState.current, { index }));
    }, []);

    const onRestore = useCallback((material: MDMaterial, index: number) => {
        setMdState(materialsInsertAt(mdState.current, { material, index }));
    }, []);

    // Exporting writes a file and returns the state untouched; recorded, it would leave a
    // duplicate snapshot on the stack and an Undo that visibly does nothing.
    const onExport = useCallback((format: ExportFormat, useMultiple: boolean) => {
        setMdState(materialsExport(mdState.current, { format, useMultiple }), {
            recordHistory: false,
        });
    }, []);

    const content = (
        <MaterialsDesignerComponent
            mdState={mdState.current}
            onUndo={undo}
            onRedo={redo}
            onReset={reset}
            onUpdate={onUpdate}
            onNameUpdate={onNameUpdate}
            onItemClick={onItemClick}
            onClone={onClone}
            onToggleIsNonPeriodic={onToggleIsNonPeriodic}
            onGenerateSupercell={onGenerateSupercell}
            onGenerateSurface={onGenerateSurface}
            onSetBoundaryConditions={onSetBoundaryConditions}
            onAdd={onAdd}
            onRemove={onRemove}
            onRestore={onRestore}
            onExport={onExport}
            canUndo={canUndo}
            canRedo={canRedo}
            {...props}
        />
    );

    return <div>{skipAlertProvider ? content : <AlertProvider>{content}</AlertProvider>}</div>;
}
