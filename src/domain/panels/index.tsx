/**
 * MD 2.0 — Operation Panels and the Catalog-lite.
 *
 * A panel is what a v1 modal dialog becomes once the viewport must stay
 * visible: it renders into the Inspector zone, keeps its own draft state,
 * forecasts the result through the registry on every keystroke, and commits
 * exactly one operation when Apply is pressed. Nothing here mutates the
 * session — a panel only calls `onApply(type, params)`, and the caller records
 * the step (src/core/session.ts `applyOperation`).
 *
 * ---------------------------------------------------------------------------
 * CSS CONTRACT — every class name used by this folder. All are plain strings,
 * `md2-`-prefixed; no styling library is imported, and no inline style objects
 * are written. Two attribute hooks carry variants so the class list stays flat:
 *   - `.md2-badge[data-engine="native|notebook|code"]` — engine colour.
 *   - `.md2-catalog-card:disabled`                    — an unavailable card.
 *
 * Panel chrome
 *   md2-panel          the panel root (a <section> in the Inspector zone)
 *   md2-panel-head     head strip: glyph + title + engine badge
 *   md2-panel-title    the <h2> inside the head
 *   md2-panel-body     scrolling area holding the sections
 *   md2-section        one labelled group of fields
 *   md2-section-title  its heading row (label on the left, hint on the right)
 *   md2-hint           "last used: 3×3×1" / result count; a <button> when it
 *                      restores those parameters, a <span> otherwise
 *   md2-icon           the single-glyph operation icon (panel head + cards)
 *   md2-badge          engine badge (NATIVE / NOTEBOOK / CODE)
 *
 * Fields
 *   md2-field-row      one <label> + control row
 *   md2-field          the control itself: <input type=number|search>, <select>
 *   md2-unit           unit suffix inside a label ("Å")
 *   md2-matrix-grid    3×3 grid of matrix inputs (children are .md2-field)
 *
 * Result and messages
 *   md2-predict        PREDICTED RESULT block; one <div> per line, aria-live
 *   md2-predict-error  modifier on md2-predict when the forecast failed
 *   md2-note           quiet explanatory line (units, rules, disabled reason)
 *   md2-note-warn      modifier on md2-note for cautions
 *
 * Actions
 *   md2-actions        the Cancel / Apply row
 *   md2-btn            a button
 *   md2-btn-primary    modifier on md2-btn for Apply
 *
 * Catalog-lite
 *   md2-catalog        the catalog root (<section>)
 *   md2-catalog-head   search field + result count + close button
 *   md2-catalog-list   the cards container
 *   md2-catalog-card   one card, a <button>; disabled when unavailable
 *   md2-catalog-title  the card's operation name
 *   md2-catalog-desc   the card's one-line description
 * ---------------------------------------------------------------------------
 */
import type { ComponentType } from "react";

import { BoundaryConditionsPanel } from "./BoundaryConditionsPanel";
import type { OperationPanelProps } from "./shared";
import { PANEL_META } from "./shared";
import { SupercellPanel } from "./SupercellPanel";
import { SurfacePanel } from "./SurfacePanel";

export type { OperationPanelProps } from "./shared";
export type { BoundaryConditionsParams } from "./BoundaryConditionsPanel";
export type { SupercellParams } from "./SupercellPanel";
export { BoundaryConditionsPanel } from "./BoundaryConditionsPanel";
export { SupercellPanel } from "./SupercellPanel";
export { SurfacePanel } from "./SurfacePanel";
export { PANEL_META, MAX_PREDICTED_ATOMS, PREVIEW_ATOM_LIMIT } from "./shared";
// The kit the next panel is built from: same chrome, same forecast, same classes.
export type { Forecast, PanelEngine } from "./shared";
export { NumberField, PanelFrame, PredictedResult, Section, useForecast } from "./shared";

export type { CatalogEntry, CatalogLiteProps } from "./catalog";
export { CATALOG, CatalogLite, filterCatalog } from "./catalog";

export interface PanelDefinition {
    title: string;
    /** A single emoji / unicode glyph. */
    icon: string;
    Component: ComponentType<OperationPanelProps>;
}

/**
 * The operation types that have a panel. Keyed by the registry's operation
 * type, so a Catalog card, a Timeline chip and a panel are the same identity.
 */
export const PANELS: Record<string, PanelDefinition> = {
    supercell: { ...PANEL_META.supercell, Component: SupercellPanel },
    surface: { ...PANEL_META.surface, Component: SurfacePanel },
    "boundary-conditions": {
        ...PANEL_META["boundary-conditions"],
        Component: BoundaryConditionsPanel,
    },
};

export default PANELS;
