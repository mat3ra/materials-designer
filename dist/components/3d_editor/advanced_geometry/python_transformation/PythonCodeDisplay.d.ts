import React from "react";
interface PythonCodeDisplayProps {
    name?: string;
    pythonCode: string;
    pythonOutput: string;
    setPythonCode: (pythonCode: string) => void;
    clearPythonOutput: () => void;
}
declare const PythonCodeDisplay: (props: PythonCodeDisplayProps) => React.JSX.Element;
export default PythonCodeDisplay;
