import Switch from "@mui/material/Switch";
import React from "react";

export interface ToggleSwitchProps {
    color: string;
    title: string;
    onStateChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
    checked: boolean;
    id: string;
    name?: string;
    disabled?: boolean;
}

function ToggleSwitch({
    color,
    id,
    title,
    name = "",
    checked,
    disabled = false,
    onStateChange,
}: ToggleSwitchProps) {
    const htmlFor = "form-" + id + "-label";
    return (
        <div data-ts-color={color}>
            <label id={id + "-label"} htmlFor={htmlFor}>
                {title}
            </label>
            <Switch
                id={htmlFor}
                name={name}
                checked={checked}
                disabled={disabled}
                onChange={onStateChange}
                inputProps={{ "aria-label": "controlled" }}
            />
        </div>
    );
}

export default ToggleSwitch;
