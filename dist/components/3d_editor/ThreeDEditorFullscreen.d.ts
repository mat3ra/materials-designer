export class ThreeDEditorFullscreen extends ThreeDEditor {
}
export namespace ThreeDEditorFullscreen {
    namespace propTypes {
        const material: PropTypes.Requireable<object>;
        const isConventionalCellShown: PropTypes.Requireable<boolean>;
        const onUpdate: PropTypes.Requireable<(...args: any[]) => any>;
        const editable: PropTypes.Requireable<boolean>;
    }
}
import { ThreeDEditor } from "@exabyte-io/wave.js";
import PropTypes from "prop-types";
