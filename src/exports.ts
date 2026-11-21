/**
 * The published surface.
 *
 * Everything web-app imports from `@mat3ra/materials-designer` is named here, and nothing else is
 * supported. Changing a line in this file is a breaking change to another repository, so treat the
 * table in plan/cutover/PARITY.md as its changelog.
 */
export { default as CodeMirror } from "@mat3ra/cove/dist/other/codemirror/CodeMirror";
export { parseViewSettingsFromUrlParams, serializeViewSettingsToUrlParams } from "@mat3ra/wave.js";

export { MDMaterial } from "./MDMaterial";
// The platform's entry point, now the 2.0 adapter: same props, an operation log behind them.
export { MaterialsDesignerContainer } from "./embed/MaterialsDesignerContainer";
export type { MaterialsDesignerContainerProps } from "./embed/MaterialsDesignerContainer";
// Three v1 components web-app renders itself. They live in src/compat and are not used here.
export { ActionDialog } from "./compat/ActionDialog";
export { default as BasisText } from "./compat/BasisText";
export { ThreeDEditorFullscreen } from "./compat/ThreeDEditorFullscreen";
