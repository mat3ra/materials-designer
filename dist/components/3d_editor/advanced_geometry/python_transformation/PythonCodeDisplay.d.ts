interface PythonCodeDisplayProps {
    name?: string;
    pythonCode: string;
    pythonOutput: string;
    setPythonCode: (pythonCode: string) => void;
    clearPythonOutput: () => void;
}
declare const PythonCodeDisplay: (props: PythonCodeDisplayProps) => import("react/jsx-runtime").JSX.Element;
export default PythonCodeDisplay;
