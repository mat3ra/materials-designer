/* eslint-disable react/jsx-props-no-spreading */
/**
 * The `materials_in` / `materials_out` picker.
 *
 * Ported from v1 essentially unchanged, and deliberately so: `JupyterLiteTransformationDialog`
 * (the Cypress widget the 53 notebook health-checks drive) addresses this control through
 * `data-tid="materials-in-selector"`, `data-tid="select-material"`, `.MuiAutocomplete-popper` and
 * the chip's delete icon. Keeping the markup keeps those 53 features passing without touching a
 * widget — the flip only has to repoint the step that *opens* the surface.
 *
 * It takes named items rather than materials so the output list, which holds configs the notebook
 * produced and the session has not adopted yet, can use the same control.
 */
import CheckBox from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlank from "@mui/icons-material/CheckBoxOutlineBlank";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import React, { useEffect } from "react";

export interface NamedItem {
    id: string;
    name: string;
}

export interface MaterialsSelectorProps<T extends NamedItem> {
    items: T[];
    selected: T[];
    onChange: (selected: T[]) => void;
    testId: string;
    label: string;
    placeholder?: string;
    disabled?: boolean;
}

export function MaterialsSelector<T extends NamedItem>({
    items,
    selected,
    onChange,
    testId,
    label,
    placeholder,
    disabled,
}: MaterialsSelectorProps<T>) {
    // A selection can outlive what it points at — deleting a material while the Console is open,
    // or a re-run replacing the notebook's output. Prune rather than render a dangling chip.
    useEffect(() => {
        const surviving = selected.filter((item) => items.some((one) => one.id === item.id));
        if (surviving.length !== selected.length) onChange(surviving);
    }, [items, selected, onChange]);

    return (
        <Autocomplete
            multiple
            data-tid={testId}
            size="small"
            disabled={disabled}
            options={items}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.name}
            value={selected}
            onChange={(_event, next) => onChange(next as T[])}
            renderOption={(props, option, { selected: isSelected }) => (
                <li {...props} key={option.id} data-tid="select-material">
                    <Checkbox
                        icon={<CheckBoxOutlineBlank fontSize="small" />}
                        checkedIcon={<CheckBox fontSize="small" />}
                        checked={isSelected}
                    />
                    {option.name}
                </li>
            )}
            renderInput={(params) => (
                <TextField {...params} label={label} placeholder={placeholder} size="small" />
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
