/* eslint-disable react/jsx-props-no-spreading */
import { AlertProvider } from "@mat3ra/cove/dist/theme/provider";
import type { Matrix3X3Schema } from "@mat3ra/esse/dist/js/types";
import type { ViewSettingsFromUrl } from "@mat3ra/wave.js/dist/utils/viewSettingsUrl";
import React, { useCallback, useEffect, useState } from "react";

import type { MaterialsSyncPayload } from "./components/repl/materialsBinding";
import MaterialsDesignerComponent from "./MaterialsDesigner";
import { MDMaterial } from "./MDMaterial";
import { materialsAdd, materialsExport, materialsRemove } from "./reducers/InputOutput";
import {
    type BoundaryConditionsType,
    type MDState,
    type SurfaceConfig,
    materialsCloneOne,
    materialsGenerateSupercellForOne,
    materialsGenerateSurfaceForOne,
    materialsSetBoundaryConditionsForOne,
    materialsSyncScope,
    materialsToggleIsNonPeriodicForOne,
    materialsUpdateIndex,
    materialsUpdateNameForOne,
    materialsUpdateOne,
} from "./reducers/Material";

// Extend Window interface to include MDState
declare global {
    interface Window {
        MDState: MDState;
    }
}

function useUndoableState<T extends MDState>(initialValue: T, maxPastSize = 50) {
    const [past, setPast] = useState<T[]>([]);
    const [future, setFuture] = useState<T[]>([]);
    const presentRef = React.useRef<T>(initialValue);

    window.MDState = presentRef.current;

    const setState = useCallback(
        (newValue: T) => {
            setPast((prevPast) => {
                const newPast = [...prevPast, presentRef.current];
                // Keep only the most recent maxPastSize entries
                return newPast.slice(-maxPastSize);
            });
            presentRef.current = newValue;
            setFuture([]); // clear redo history on new change
        },
        [maxPastSize],
    );

    const undo = useCallback(() => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        setPast(past.slice(0, -1));
        setFuture([presentRef.current, ...future]);
        presentRef.current = previous;
    }, [past, future]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        setFuture(future.slice(1));
        setPast([...past, presentRef.current]);
        presentRef.current = next;
    }, [future, past]);

    const reset = useCallback(() => {
        setPast([]);
        setFuture([]);
        presentRef.current = initialValue;
    }, []);

    const canUndo = past.length > 0;
    const canRedo = future.length > 0;

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

export interface ImportModalProps {
    show: boolean;
    onSubmit: (materials: MDMaterial[]) => void;
}

export interface MaterialsDesignerContainerProps {
    skipAlertProvider?: boolean;
    /** See README section 3.7: hosts serving the REPL wheels off-origin pass their base URL here. */
    replWheelBaseUrl?: string;
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
    const [mdState, setMdState, undo, redo, reset] = useUndoableState<MDState>({
        index: 0,
        isLoading: false,
        materials: initialMaterials,
        updatedIndices: [],
    });

    useEffect(() => {
        setMdState({ ...mdState.current, isLoading });
    }, [isLoading]);

    const onUpdate = useCallback((material: MDMaterial, index: number) => {
        setMdState(materialsUpdateOne(mdState.current, { material, index }));
    }, []);

    const onReplSync = useCallback((payload: MaterialsSyncPayload) => {
        setMdState(materialsSyncScope(mdState.current, payload));
    }, []);

    const onNameUpdate = useCallback((name: string, index: number) => {
        setMdState(materialsUpdateNameForOne(mdState.current, { name, index }));
    }, []);

    const onItemClick = useCallback((index: number) => {
        setMdState(materialsUpdateIndex(mdState.current, { index }));
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

    const onSetBoundaryConditions = useCallback(
        (config: { boundaryType: BoundaryConditionsType; boundaryOffset: number }) => {
            setMdState(materialsSetBoundaryConditionsForOne(mdState.current, config));
        },
        [],
    );

    const onAdd = useCallback((materials: MDMaterial | MDMaterial[], addAtIndex?: boolean) => {
        setMdState(materialsAdd(mdState.current, { materials, addAtIndex }));
    }, []);

    const onRemove = useCallback((index: number) => {
        setMdState(materialsRemove(mdState.current, { index }));
    }, []);

    const onExport = useCallback((format: "json" | "poscar", useMultiple: boolean) => {
        setMdState(materialsExport(mdState.current, { format, useMultiple }));
    }, []);

    const content = (
        // @ts-ignore
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
            onExport={onExport}
            onReplSync={onReplSync}
            {...props}
        />
    );

    return <div>{skipAlertProvider ? content : <AlertProvider>{content}</AlertProvider>}</div>;
}
