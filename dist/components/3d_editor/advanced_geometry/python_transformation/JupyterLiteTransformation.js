import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import { darkScrollbar } from "@mui/material";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { theme } from "../../../../settings";
import BaseJupyterLiteSessionComponent from "../../../include/jupyterlite/BaseJupyterLiteComponent";
import MaterialsSelector from "./MaterialsSelector";
class JupyterLiteTransformationDialog extends BaseJupyterLiteSessionComponent {
    constructor(props) {
        super(props);
        this.handleSubmit = () => {
            const { newMaterials } = this.state;
            this.props.onMaterialsUpdate(newMaterials);
        };
        this.setMaterials = (newMaterials) => {
            this.setState({ newMaterials });
        };
        this.getMaterialsToUse = () => {
            return this.state.selectedMaterials;
        };
        this.state = {
            selectedMaterials: [this.props.materials[0]],
            newMaterials: [],
        };
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.materials !== this.props.materials) {
            this.setState({ selectedMaterials: [this.props.materials[0]] });
        }
        if (prevState.selectedMaterials !== this.state.selectedMaterials) {
            this.sendMaterials();
        }
    }
    render() {
        const { title, show, onHide, materials } = this.props;
        const { selectedMaterials, newMaterials } = this.state;
        return (_jsx(Dialog, { id: "jupyterlite-transformation-dialog", open: show, onClose: onHide, fullWidth: true, maxWidth: "xl", onSubmit: this.handleSubmit, title: title, isSubmitButtonDisabled: newMaterials.length === 0, children: _jsxs(Grid, { container: true, spacing: 1, id: "jupyterlite-transformation-dialog-content", sx: {
                    height: "calc(100vh - 260px)",
                    ...(theme.palette.mode === "dark" ? darkScrollbar() : null),
                }, children: [_jsx(Grid, { item: true, xs: 12, md: 4, alignItems: "center", children: _jsxs(Typography, { variant: "subtitle1", children: ["Input Materials (", _jsx("code", { children: "materials_in" }), ")"] }) }), _jsx(Grid, { item: true, xs: 12, md: 8, children: _jsx(MaterialsSelector, { materials: materials, selectedMaterials: selectedMaterials, setSelectedMaterials: (newMaterials) => this.setState({ selectedMaterials: newMaterials }), testId: "materials-in-selector" }) }), _jsx(Grid, { pt: 0, item: true, xs: 12, id: "execution-cells", sx: {
                            height: "calc(100% - 80px)",
                            overflow: "hidden",
                        }, children: _jsx(Paper, { sx: {
                                height: "100%",
                            }, children: super.render() }) }), _jsx(Grid, { item: true, container: true, xs: 12, md: 4, alignItems: "center", children: _jsxs(Typography, { variant: "subtitle1", children: ["Output Materials (", _jsx("code", { children: "materials_out" }), ")"] }) }), _jsx(Grid, { item: true, xs: 12, md: 8, children: _jsx(MaterialsSelector, { materials: newMaterials, selectedMaterials: newMaterials, setSelectedMaterials: (newMaterials) => this.setState({ newMaterials }), testId: "materials-out-selector" }) })] }) }));
    }
}
export default JupyterLiteTransformationDialog;
