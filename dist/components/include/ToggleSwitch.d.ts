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
        const color: PropTypes.Validator<string>;
        const title: PropTypes.Validator<string>;
        const onStateChange: PropTypes.Validator<(...args: any[]) => any>;
        const checked: PropTypes.Validator<boolean>;
        const id: PropTypes.Validator<string>;
        const name: PropTypes.Requireable<string>;
        const disabled: PropTypes.Requireable<boolean>;
    }
    namespace defaultProps {
        const name_1: string;
        export { name_1 as name };
        const disabled_1: boolean;
        export { disabled_1 as disabled };
    }
}
import PropTypes from "prop-types";
