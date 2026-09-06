/**
 * The platform's entry point.
 *
 * web-app renders this inline and hands it a small, exact set of props. 2.0's own state is an
 * operation log rather than a list of materials, so this file is the adapter between the two: it
 * seeds a session from the host's materials, routes the host's file-level actions onto commands,
 * and projects the session back into the `MDState` shape the save dialog expects.
 *
 * Everything here exists so that nothing above it has to know a host is present.
 */
import React, { useMemo } from "react";

import { MaterialsDesigner } from "../domain/MaterialsDesigner";
import { toMaterialDoc } from "./docs";
import type { MDStateView } from "../domain/mdState";
import type { MDMaterial } from "../MDMaterial";

export interface ImportModalProps {
    show: boolean;
    onSubmit: (materials: MDMaterial[]) => void;
}

/*
 * Three props are accepted and not yet honoured: `skipAlertProvider` (2.0 renders its own notices
 * rather than a notistack provider, so there is nothing to skip), `initialViewSettings` and
 * `isConventionalCellShown` (both belong to the viewport and wait on wave.js taking them as
 * controlled props). They stay in the type because the platform passes them and dropping them from
 * the signature would be a silent breaking change; the parity ledger records that they are inert.
 */
/* eslint-disable react/no-unused-prop-types */
export interface MaterialsDesignerContainerProps {
    /** Seeds the session. Each arrives as a step-0 origin, so it has a history from the start. */
    initialMaterials?: MDMaterial[];
    isLoading?: boolean;
    skipAlertProvider?: boolean;
    /** Host-injected; the matching commands disable themselves when absent, as in v1. */
    openImportModal?: (params: ImportModalProps) => void;
    closeImportModal?: () => void;
    openSaveActionDialog?: (state: MDStateView) => void;
    onExit?: () => void;
    isConventionalCellShown?: boolean;
    maxCombinatorialBasesCount?: number;
    initialViewSettings?: object;
}

export function MaterialsDesignerContainer({
    initialMaterials,
    isLoading = false,
    openImportModal,
    closeImportModal,
    openSaveActionDialog,
    onExit,
    isConventionalCellShown = false,
    maxCombinatorialBasesCount = 100,
}: MaterialsDesignerContainerProps) {
    const initialDocs = useMemo(
        () => (initialMaterials?.length ? initialMaterials.map(toMaterialDoc) : undefined),
        // Seeding happens once, deliberately: the host owns what the session started from, not
        // what it has become. Re-running this when the prop identity changes would discard
        // whatever the user had done since.
        // eslint-disable-next-line
        [],
    );

    return (
        <MaterialsDesigner
            initialDocs={initialDocs}
            isLoading={isLoading}
            isConventionalCellShown={isConventionalCellShown}
            maxCombinatorialBasesCount={maxCombinatorialBasesCount}
            // Present only when the platform injected them; each command self-disables otherwise.
            host={{
                import: openImportModal
                    ? () =>
                          openImportModal({
                              show: true,
                              onSubmit: () => closeImportModal?.(),
                          })
                    : undefined,
                save: openSaveActionDialog,
                exit: onExit,
            }}
            // A session restored from localStorage would overwrite what the platform just handed
            // us, so the embedded costume does not restore.
            persistence="none"
        />
    );
}

export default MaterialsDesignerContainer;
