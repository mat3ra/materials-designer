/* eslint-disable react/jsx-props-no-spreading */
import { AlertProvider } from "@exabyte-io/cove.js/dist/theme/provider";
import lodash from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import logger from "redux-logger";
import { ActionCreators } from "redux-undo";
import _ from "underscore";

import {
    addMaterials,
    cloneOneMaterial,
    exportMaterials,
    generateSupercellForOneMaterial,
    generateSurfaceForOneMaterial,
    MATERIALS_SAVE,
    materialsToggleIsNonPeriodicForOne,
    removeMaterials,
    resetState,
    saveMaterials,
    setBoundaryConditionsForOneMaterial,
    updateMaterialsIndex,
    updateNameForOneMaterial,
    updateOneMaterial,
} from "./actions";
import { Material } from "./material";
import MaterialsDesignerComponent from "./MaterialsDesigner";
import { createMaterialsDesignerReducer } from "./reducers";
import ReduxProvider from "./utils/react/provider";

const initialMaterials = Array(1).fill(new Material());

const initialState = ({ materials = initialMaterials } = {}) => {
    return {
        index: 0,
        isLoading: false,
        materials,
    };
};

const mapStateToProps = (state, ownProps) => {
    // handle redux-undo modifications to state
    const { present } = state;
    return {
        index: present.index,
        material: present.materials ? present.materials[present.index] : null,
        materials: present.materials,
        editable: lodash.get(present, "editable", false),
        isLoading: present.isLoading,
        ...ownProps.parentProps,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        // Material
        onUpdate: (material, index) => dispatch(updateOneMaterial(material, index)),
        onNameUpdate: (name, index) => dispatch(updateNameForOneMaterial(name, index)),
        onItemClick: (index) => dispatch(updateMaterialsIndex(index)),

        // Toolbar
        onAdd: (materials, addAtIndex) => dispatch(addMaterials(materials, addAtIndex)),
        onRemove: (indices) => dispatch(removeMaterials(indices)),
        onExport: (format, useMultiple) => dispatch(exportMaterials(format, useMultiple)),
        onSave: (config) => dispatch(saveMaterials(config, dispatch)),

        onGenerateSupercell: (matrix) => dispatch(generateSupercellForOneMaterial(matrix)),
        onGenerateSurface: (config) => dispatch(generateSurfaceForOneMaterial(config)),
        onSetBoundaryConditions: (config) => dispatch(setBoundaryConditionsForOneMaterial(config)),

        // Undo-Redo
        onUndo: () => dispatch(ActionCreators.undo()),
        onRedo: () => dispatch(ActionCreators.redo()),
        onReset: () => dispatch(resetState(initialState())),
        onClone: () => dispatch(cloneOneMaterial()),
        onToggleIsNonPeriodic: () => dispatch(materialsToggleIsNonPeriodicForOne()),
    };
};

const MaterialsDesignerContainerHelper = connect(
    mapStateToProps,
    mapDispatchToProps,
)(MaterialsDesignerComponent);

export class MaterialsDesignerContainer extends React.Component {
    constructor(props) {
        super(props);
        const initialState_ = initialState({ materials: props.initialMaterials });
        const externalReducers = props.materialsSave
            ? { [MATERIALS_SAVE]: props.materialsSave }
            : {};
        const reducer = createMaterialsDesignerReducer(initialState_, externalReducers);
        this.store = createStore(
            reducer,
            props.applyMiddleware ? applyMiddleware(logger) : undefined,
        );
        this.container = MaterialsDesignerContainerHelper;
    }

    render() {
        const props = _.omit(this.props, "component");
        return (
            <div>
                {props.skipAlertProvider ? (
                    <ReduxProvider {...props} container={this.container} store={this.store} />
                ) : (
                    <AlertProvider>
                        <ReduxProvider {...props} container={this.container} store={this.store} />
                    </AlertProvider>
                )}
            </div>
        );
    }
}

MaterialsDesignerContainer.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types, react/require-default-props
    childrenProps: PropTypes.object,
    applyMiddleware: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    initialMaterials: PropTypes.array,
    // eslint-disable-next-line react/require-default-props
    onExit: PropTypes.func,
    // eslint-disable-next-line react/require-default-props
    openImportModal: PropTypes.func,
    // eslint-disable-next-line react/require-default-props
    closeImportModal: PropTypes.func,
    // eslint-disable-next-line react/require-default-props
    openSaveActionDialog: PropTypes.func,
    // eslint-disable-next-line react/require-default-props
    materialsSave: PropTypes.func,
    // eslint-disable-next-line react/require-default-props
    maxCombinatorialBasesCount: PropTypes.number,
    // eslint-disable-next-line react/require-default-props
    isConventionalCellShown: PropTypes.bool,
    // multiple alert providers lead to broken alerts in web-app
    skipAlertProvider: PropTypes.bool,
};

MaterialsDesignerContainer.defaultProps = {
    applyMiddleware: true,
    initialMaterials,
    maxCombinatorialBasesCount: 100,
    onExit: () => {},
    skipAlertProvider: false,
};
