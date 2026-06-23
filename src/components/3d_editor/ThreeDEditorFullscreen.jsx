import { ThreeDEditor } from "@exabyte-io/wave.js";
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
