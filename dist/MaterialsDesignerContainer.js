import { jsx as _jsx } from "react/jsx-runtime";
/* eslint-disable react/jsx-props-no-spreading */
import { AlertProvider } from "@exabyte-io/cove.js/dist/theme/provider";
import React, { useCallback, useEffect, useState } from "react";
import MaterialsDesignerComponent from "./MaterialsDesigner";
import { MDMaterial } from "./MDMaterial";
import { materialsAdd, materialsExport, materialsRemove } from "./reducers/InputOutput";
import { materialsCloneOne, materialsGenerateSupercellForOne, materialsGenerateSurfaceForOne, materialsSetBoundaryConditionsForOne, materialsToggleIsNonPeriodicForOne, materialsUpdateIndex, materialsUpdateNameForOne, materialsUpdateOne, } from "./reducers/Material";
function useUndoableState(initialValue, maxPastSize = 50) {
    const [past, setPast] = useState([]);
    const [future, setFuture] = useState([]);
    const presentRef = React.useRef(initialValue);
    window.MDState = presentRef.current;
    const setState = useCallback((newValue) => {
        setPast((prevPast) => {
            const newPast = [...prevPast, presentRef.current];
            // Keep only the most recent maxPastSize entries
            return newPast.slice(-maxPastSize);
        });
        presentRef.current = newValue;
        setFuture([]); // clear redo history on new change
    }, [maxPastSize]);
    const undo = useCallback(() => {
        if (past.length === 0)
            return;
        const previous = past[past.length - 1];
        setPast(past.slice(0, -1));
        setFuture([presentRef.current, ...future]);
        presentRef.current = previous;
    }, [past, future]);
    const redo = useCallback(() => {
        if (future.length === 0)
            return;
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
    return [presentRef, setState, undo, redo, reset, canUndo, canRedo];
}
export function MaterialsDesignerContainer({ initialMaterials = [new MDMaterial()], skipAlertProvider = false, isLoading = false, ...props }) {
    const [mdState, setMdState, undo, redo, reset] = useUndoableState({
        index: 0,
        isLoading: false,
        materials: initialMaterials,
    });
    useEffect(() => {
        setMdState({ ...mdState.current, isLoading });
    }, [isLoading]);
    const onUpdate = useCallback((material, index) => {
        setMdState(materialsUpdateOne(mdState.current, { material, index }));
    }, []);
    const onNameUpdate = useCallback((name, index) => {
        setMdState(materialsUpdateNameForOne(mdState.current, { name, index }));
    }, []);
    const onItemClick = useCallback((index) => {
        setMdState(materialsUpdateIndex(mdState.current, { index }));
    }, []);
    const onClone = useCallback(() => {
        setMdState(materialsCloneOne(mdState.current));
    }, []);
    const onToggleIsNonPeriodic = useCallback(() => {
        setMdState(materialsToggleIsNonPeriodicForOne(mdState.current));
    }, []);
    const onGenerateSupercell = useCallback((matrix) => {
        setMdState(materialsGenerateSupercellForOne(mdState.current, { matrix }));
    }, []);
    const onGenerateSurface = useCallback((config) => {
        setMdState(materialsGenerateSurfaceForOne(mdState.current, config));
    }, []);
    const onSetBoundaryConditions = useCallback((config) => {
        setMdState(materialsSetBoundaryConditionsForOne(mdState.current, config));
    }, []);
    const onAdd = useCallback((materials, addAtIndex) => {
        setMdState(materialsAdd(mdState.current, { materials, addAtIndex }));
    }, []);
    const onRemove = useCallback((index) => {
        setMdState(materialsRemove(mdState.current, { index }));
    }, []);
    const onExport = useCallback((format, useMultiple) => {
        setMdState(materialsExport(mdState.current, { format, useMultiple }));
    }, []);
    const content = (
    // @ts-ignore
    _jsx(MaterialsDesignerComponent, { mdState: mdState.current, onUndo: undo, onRedo: redo, onReset: reset, onUpdate: onUpdate, onNameUpdate: onNameUpdate, onItemClick: onItemClick, onClone: onClone, onToggleIsNonPeriodic: onToggleIsNonPeriodic, onGenerateSupercell: onGenerateSupercell, onGenerateSurface: onGenerateSurface, onSetBoundaryConditions: onSetBoundaryConditions, onAdd: onAdd, onRemove: onRemove, onExport: onExport, ...props }));
    return _jsx("div", { children: skipAlertProvider ? content : _jsx(AlertProvider, { children: content }) });
}
