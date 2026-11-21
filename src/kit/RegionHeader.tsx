/**
 * A region's title, doubling as its collapse control.
 *
 * The affordance belongs on the thing it acts on. The workspace bar can hide a region entirely,
 * but "give me that space back" is a thought you have while looking at the panel, not while
 * looking at a toolbar — so the title is the button.
 *
 * Collapsed, the region is railed to its glyph and this is what remains visible, which is why the
 * glyph is required rather than decorative: it is the only thing identifying the rail.
 */
import React from "react";

export interface RegionHeaderProps {
    /** Addressed by specs as `[data-collapse="<region>"]`. */
    region: string;
    title: string;
    /** Shown beside the title, and alone under the glyph when railed. */
    count?: React.ReactNode;
    /** Identifies the rail once the title is gone. */
    glyph: string;
    collapsed: boolean;
    onToggle: () => void;
    /** Rendered after the title while expanded — a filter, an action. */
    children?: React.ReactNode;
}

export function RegionHeader({
    region,
    title,
    count,
    glyph,
    collapsed,
    onToggle,
    children,
}: RegionHeaderProps) {
    return (
        <div className={`md2-rhead${collapsed ? " md2-rhead-rail" : ""}`}>
            <button
                type="button"
                className="md2-rhead-toggle"
                data-collapse={region}
                aria-expanded={!collapsed}
                title={
                    collapsed ? `Expand ${title.toLowerCase()}` : `Collapse ${title.toLowerCase()}`
                }
                onClick={onToggle}
            >
                <span className="md2-rhead-glyph" aria-hidden="true">
                    {glyph}
                </span>
                <span className="md2-htitle md2-rhead-title">{title}</span>
                {count !== undefined && count}
            </button>
            {!collapsed && children}
        </div>
    );
}
