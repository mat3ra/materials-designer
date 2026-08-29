import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import React from "react";

import { randomAlphanumeric } from "../../../utils/str";

export interface ButtonActivatedMenuProps {
    title?: string;
    id?: string;
    isOpen?: boolean;
    children?: React.ReactNode;
}

interface ButtonActivatedMenuState {
    isOpen: boolean;
    anchorEl: HTMLElement | null;
}

export class ButtonActivatedMenuMaterialUI extends React.Component<
    ButtonActivatedMenuProps,
    ButtonActivatedMenuState
> {
    /**
     * Per instance, not per module. `defaultProps = { id: randomAlphanumeric(10) }` ran once at
     * import time, so every menu that did not pass an id shared the same DOM id - five of them in
     * the header alone. Generating it in the constructor also keeps it stable across renders,
     * which a destructuring default would not.
     */
    private readonly fallbackId = randomAlphanumeric(10);

    constructor(props: ButtonActivatedMenuProps) {
        super(props);
        this.state = {
            isOpen: Boolean(props.isOpen),
            anchorEl: null,
        };
    }

    handleClick = (event: React.MouseEvent<HTMLElement>) => {
        const { isOpen } = this.state;
        this.setState({ isOpen: !isOpen, anchorEl: event.currentTarget });
    };

    handleClose = () => this.setState({ isOpen: false });

    render() {
        const { isOpen, anchorEl } = this.state;
        const { title = "", id, children } = this.props;
        return (
            <>
                <Button
                    className={isOpen ? "active" : ""}
                    disableRipple
                    size="small"
                    color="inherit"
                    onClick={this.handleClick}
                    data-name={title}
                >
                    {title}
                </Button>
                <Menu
                    MenuListProps={{ dense: true }}
                    id={id ?? this.fallbackId}
                    open={isOpen}
                    anchorEl={anchorEl}
                    className="button-activated-menu"
                    data-name={title + "-menu"}
                    onClick={this.handleClose}
                >
                    {children}
                </Menu>
            </>
        );
    }
}
