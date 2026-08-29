import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import { showWarningAlert } from "@mat3ra/cove/dist/other/alerts";
import { Made } from "@mat3ra/made";
import type { AtomicLabelValue } from "@mat3ra/made/dist/js/basis/labels";
import type { Cell } from "@mat3ra/made/dist/js/cell/cell";
import React from "react";
import _ from "underscore";

import { displayMessage } from "../../../i18n/messages";
import { MDMaterial } from "../../../MDMaterial";
import BasisText from "../../source_editor/BasisText";

// TODO: adjust this component and SourceEditor to inherit from the same one - XYZBasisEditor

export interface CombinatorialBasisDialogProps {
    isOpen: boolean;
    material: MDMaterial;
    onSubmit: (materials: MDMaterial[]) => void;
    onHide: () => void;
    maxCombinatorialBasesCount?: number;
    modalId: string;
}

interface CombinatorialBasisDialogState {
    xyz: string;
}

class CombinatorialBasisDialog extends React.Component<
    CombinatorialBasisDialogProps,
    CombinatorialBasisDialogState
> {
    /** Set by the BasisText ref; consulted so an invalid basis is not submitted. */
    BasisTextComponent: BasisText | null = null;

    constructor(props: CombinatorialBasisDialogProps) {
        super(props);
        const { material } = this.props;

        this.state = {
            xyz: material.getBasisAsXyz(),
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(content: string) {
        // update the input field immediately on typing
        this.setState({ xyz: content });
    }

    handleSubmit() {
        if (!this.BasisTextComponent?.state.isContentValidated) return; // don't proceed if cannot validate xyz
        const { xyz } = this.state;
        const { material, onSubmit } = this.props;
        // TODO: avoid modifying materials directly inside this component move the below logic to reducer

        // create combinatorial set from a given basis
        const newBases = new Made.parsers.xyz.CombinatorialBasis(xyz).allBasisConfigs;

        if (!this.assertCombinatorialBasesCount(newBases)) return;

        const newMaterials: MDMaterial[] = [];
        _.each(newBases, (elm) => {
            // first set units from existing material, as allBasises() returns no units
            const latticeConfig = material.lattice;
            const lattice = new Made.Lattice(latticeConfig);
            // Two arguments here disagree with made's declared types, and both are preserved
            // rather than corrected: `cell` wants a Cell instance but is handed the raw vector
            // arrays, and `labels` wants bare values but is handed the `{ id, value }` records,
            // which `Labels.fromValues` then wraps a second time. Neither path is covered by a
            // test - see plan/upcoming/bugfixes-2026-08-29.md.
            const basis = Made.Basis.fromElementsAndCoordinates({
                elements: elm.elements,
                coordinates: elm.coordinates,
                cell: lattice.vectorArrays as unknown as Cell,
                units: material.basis.units,
                labels: material.getBasis().labels as unknown as AtomicLabelValue[],
            });
            // then create material
            const newMaterialConfig = {
                ...material.toJSON(),
                basis: basis.toJSON(),
                name: `${material.name} - ${basis.formula}`,
            };
            const newMaterial = new MDMaterial(newMaterialConfig);
            newMaterial.cleanOnCopy();
            newMaterials.push(newMaterial);
        });
        // pass up the chain
        onSubmit(newMaterials);
    }

    assertCombinatorialBasesCount(bases: unknown[]) {
        const { maxCombinatorialBasesCount = 100 } = this.props;
        if (bases.length > maxCombinatorialBasesCount) {
            showWarningAlert(
                displayMessage("combinatorialBasesCountExceeded", maxCombinatorialBasesCount),
            );
            return false;
        }
        return true;
    }

    render() {
        const { isOpen, onHide, modalId } = this.props;
        const { xyz } = this.state;

        return (
            <Dialog
                id={modalId}
                open={isOpen}
                title="Generate Combinatorial Set"
                onClose={onHide}
                onSubmit={this.handleSubmit}
            >
                <BasisText
                    ref={(el) => {
                        this.BasisTextComponent = el;
                    }}
                    className="combinatorial-basis"
                    content={xyz}
                    onChange={this.handleChange}
                />
            </Dialog>
        );
    }
}

export default CombinatorialBasisDialog;
