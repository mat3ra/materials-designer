import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable react/jsx-props-no-spreading */
import CheckBox from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlank from "@mui/icons-material/CheckBoxOutlineBlank";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { useEffect } from "react";
function MaterialsSelector(props) {
    const { materials, selectedMaterials, setSelectedMaterials, testId } = props;
    useEffect(() => {
        const updatedSelectedMaterials = selectedMaterials.filter((selectedMaterial) => materials.some((material) => material.name === selectedMaterial.name));
        if (updatedSelectedMaterials.length !== selectedMaterials.length) {
            setSelectedMaterials(updatedSelectedMaterials);
        }
    }, [materials, selectedMaterials, setSelectedMaterials]);
    return (_jsx(Autocomplete, { multiple: true, id: "materials-autocomplete", "data-tid": testId || "materials-autocomplete", size: "small", options: materials, getOptionLabel: (option) => option.name, value: selectedMaterials, onChange: (_event, newValue) => setSelectedMaterials(newValue), renderOption: (props, option, { selected }) => (_jsxs("li", { ...props, "data-tid": "select-material", children: [_jsx(Checkbox, { icon: _jsx(CheckBoxOutlineBlank, { fontSize: "small" }), checkedIcon: _jsx(CheckBox, { fontSize: "small" }), checked: selected }), option.name] })), renderInput: (params) => (_jsx(TextField, { ...params, label: "Selected Materials", placeholder: "Select materials", size: "small" })), renderTags: (value, getTagProps) => value.map((option, index) => (_jsx(Chip, { size: "small", label: `${index}: ${option.name}`, ...getTagProps({ index }) }))) }));
}
export default MaterialsSelector;
