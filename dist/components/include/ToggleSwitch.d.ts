export default ToggleSwitch;
declare function ToggleSwitch({ color, id, title, name, checked, disabled, onStateChange, }: {
    color: any;
    id: any;
    title: any;
    name: any;
    checked: any;
    disabled: any;
    onStateChange: any;
}): import("react/jsx-runtime").JSX.Element;
declare namespace ToggleSwitch {
    namespace propTypes {
        let color: PropTypes.Validator<string>;
        let title: PropTypes.Validator<string>;
        let onStateChange: PropTypes.Validator<(...args: any[]) => any>;
        let checked: PropTypes.Validator<boolean>;
        let id: PropTypes.Validator<string>;
        let name: PropTypes.Requireable<string>;
        let disabled: PropTypes.Requireable<boolean>;
    }
    namespace defaultProps {
        let name_1: string;
        export { name_1 as name };
        let disabled_1: boolean;
        export { disabled_1 as disabled };
    }
}
import PropTypes from "prop-types";
