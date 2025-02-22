/* eslint-disable react/jsx-props-no-spreading */
import CheckBox from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlank from "@mui/icons-material/CheckBoxOutlineBlank";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import React, { useEffect } from "react";

import { MDMaterial } from "../../../../MDMaterial";

interface MaterialsSelectorProps {
    materials: MDMaterial[];
    selectedMaterials: MDMaterial[];
    setSelectedMaterials: (selectedMaterials: MDMaterial[]) => void;
    testId?: string;
}

function MaterialsSelector(props: MaterialsSelectorProps) {
    const { materials, selectedMaterials, setSelectedMaterials, testId } = props;

    useEffect(() => {
        const updatedSelectedMaterials = selectedMaterials.filter((selectedMaterial) =>
            materials.some((material) => material.name === selectedMaterial.name),
        );

        if (updatedSelectedMaterials.length !== selectedMaterials.length) {
            setSelectedMaterials(updatedSelectedMaterials);
        }
    }, [materials, selectedMaterials, setSelectedMaterials]);

    return (
        <Autocomplete
            multiple
            id="materials-autocomplete"
            data-tid={testId || "materials-autocomplete"}
            size="small"
            options={materials}
            getOptionLabel={(option) => option.name}
            value={selectedMaterials}
            onChange={(_event, newValue) => setSelectedMaterials(newValue)}
            renderOption={(props, option, { selected }) => (
                <li {...props} data-tid="select-material">
                    <Checkbox
                        icon={<CheckBoxOutlineBlank fontSize="small" />}
                        checkedIcon={<CheckBox fontSize="small" />}
                        checked={selected}
                    />
                    {option.name}
                </li>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Selected Materials"
                    placeholder="Select materials"
                    size="small"
                />
            )}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip
                        size="small"
                        label={`${index}: ${option.name}`}
                        {...getTagProps({ index })}
                    />
                ))
            }
        />
    );
}

export default MaterialsSelector;
