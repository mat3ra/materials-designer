export interface Transformation {
    id: string;
    title: string;
    content: string;
}
interface TransformationSelectorProps {
    transformation: Transformation | null;
    pythonCode: string;
    setPythonCode: (pythonCode: string) => void;
    setTransformation: (transformation: Transformation | null) => void;
    url?: string;
}
declare function TransformationSelector(props: TransformationSelectorProps): import("react/jsx-runtime").JSX.Element;
export default TransformationSelector;
