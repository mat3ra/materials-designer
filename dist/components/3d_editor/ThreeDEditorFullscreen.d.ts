export class ThreeDEditorFullscreen extends ThreeDEditor {
}
export namespace ThreeDEditorFullscreen {
    namespace propTypes {
        let material: PropTypes.Requireable<object>;
        let isConventionalCellShown: PropTypes.Requireable<boolean>;
        let onUpdate: PropTypes.Requireable<(...args: any[]) => any>;
        let editable: PropTypes.Requireable<boolean>;
    }
}
import { ThreeDEditor } from "@exabyte-io/wave.js";
import PropTypes from "prop-types";
