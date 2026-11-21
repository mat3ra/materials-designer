/*
 * Kept for the platform, not for this app.
 *
 * MD 2.0 does not render this. web-app imports it through src/exports.ts, and it is standalone
 * code in another repository's tree — rewriting it in 2.0's terms is out of scope for the cutover
 * and is exactly the kind of change that breaks a platform quietly. It moved here, unchanged, so
 * that deleting v1 did not delete it.
 */
import { ThreeDEditor } from "@mat3ra/wave.js";
import PropTypes from "prop-types";

// TODO: clean up when touching this next time
export class ThreeDEditorFullscreen extends ThreeDEditor {}

ThreeDEditorFullscreen.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    material: PropTypes.object,
    isConventionalCellShown: PropTypes.bool,
    onUpdate: PropTypes.func,
    editable: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    initialViewSettings: PropTypes.object,
};
