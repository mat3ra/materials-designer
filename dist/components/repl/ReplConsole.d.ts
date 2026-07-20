import type { ReplError } from "./PyodideReplSession";
interface ReplConsoleProps {
    /** Accumulated stdout + system log lines (scrollback). */
    output: string;
    /** Structured Python error from the last run, or null. Rendered Jupyter-style. */
    error: ReplError | null;
    /** Clear scrollback + error. */
    onClear: () => void;
}
/**
 * Output console for the REPL: stdout scrollback plus — when the last run failed — a Jupyter/nbformat
 * style error block (bold `ename: evalue` headline + collapsible traceback).
 *
 * Deliberately layout-agnostic and resize-free: it fills whatever height its parent gives it (flex)
 * and only owns its own collapsed/expanded state. Sizing/splitting is the parent's job today and the
 * mosaic tile's job next — so nothing here becomes redundant when the tiling layout lands.
 */
declare function ReplConsole({ output, error, onClear }: ReplConsoleProps): import("react/jsx-runtime").JSX.Element;
export default ReplConsole;
