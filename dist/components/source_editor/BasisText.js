import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable react/sort-comp */
import CodeMirror from "@exabyte-io/cove.js/dist/other/codemirror/CodeMirror";
import { Made } from "@mat3ra/made";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import setClass from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { displayMessage } from "../../i18n/messages";
class BasisText extends React.Component {
    constructor(props) {
        super(props);
        this.codeMirrorRef = React.createRef();
        this.validateContent = (content) => {
            try {
                Made.parsers.xyz.validate(content);
                return true;
            }
            catch (e) {
                return false;
            }
        };
        this.reformatContentAndUpdateStateIfNoManualEdit = (newContent) => {
            var _a;
            const { content } = this.state;
            // Change state only if user is not editing basis
            if (!((_a = this.codeMirrorRef.current) === null || _a === void 0 ? void 0 : _a.state.isEditing) && content !== newContent) {
                // NOTE: from v 1.0.0 ReactCodeMirror is not handling the content updates properly (thus use v0.3.0)
                // https://github.com/JedWatson/react-codemirror/issues/106
                this.setState({
                    content: newContent,
                    // assuming that the content passed here is safe and valid
                    message: "",
                    isContentValidated: true,
                });
            }
        };
        this.state = {
            content: props.content,
            checks: props.checks,
            isContentValidated: true,
            message: props.message,
        };
        this.updateContent = this.updateContent.bind(this);
        // TODO: adjust tests to accommodate for the delay and re-enable
        // this.updateContent = _.debounce(this.updateContent, 700);
    }
    // eslint-disable-next-line no-unused-vars
    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        const { content: nextContent, checks: nextChecks } = nextProps;
        const { content, checks } = this.props;
        if (content !== nextContent || checks !== nextChecks) {
            this.reformatContentAndUpdateStateIfNoManualEdit(nextContent);
            this.setState({ checks: nextChecks });
        }
    }
    isContentPassingValidation(content) {
        const { isContentValidated } = this.state;
        const isValid = this.validateContent(content);
        let message = displayMessage("basis.validationError");
        if (isValid) {
            // if not previously validated, display success, otherwise remove message
            message = !isContentValidated ? displayMessage("basis.validationSuccess") : "";
        }
        this.setState({ isContentValidated: isValid, message });
        return isValid;
    }
    updateContent(newContent) {
        const { onChange, content } = this.props;
        // Avoid triggering update actions when content is set from props
        if (content === newContent)
            return;
        if (this.isContentPassingValidation(newContent)) {
            onChange(newContent);
        }
    }
    render() {
        const { className, readOnly, codeMirrorOptions } = this.props;
        const { content, isContentValidated, message, checks } = this.state;
        // Using `success.main` color below b/c of https://github.com/mui/material-ui/issues/29564
        return (_jsxs(Grid, { container: true, id: "basis-xyz", className: setClass("xyz", className), children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(CodeMirror, { ref: this.codeMirrorRef, id: "xyz-codemirror", content: content, updateContent: this.updateContent, readOnly: readOnly, options: {
                            lineNumbers: true,
                            ...codeMirrorOptions,
                        }, theme: "dark", completions: () => { }, updateOnFirstLoad: true, language: "exaxyz", checks: checks }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(Typography, { variant: "body2", color: isContentValidated ? "success.main" : "error", align: "center", children: message }) })] }));
    }
}
BasisText.propTypes = {
    className: PropTypes.string,
    message: PropTypes.string,
    content: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    checks: PropTypes.array,
    readOnly: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    codeMirrorOptions: PropTypes.object,
    onChange: PropTypes.func,
};
BasisText.defaultProps = {
    className: "",
    message: "",
    readOnly: false,
    content: "---- No content passed ----\n",
    checks: [],
    codeMirrorOptions: {},
    onChange: () => { },
};
export default BasisText;
