import { ThreeDEditor } from "@mat3ra/wave.js";

/**
 * Named subclass of wave.js's editor, kept so the app has a stable local name for it. The
 * propTypes this used to carry duplicated wave's own and constrained nothing.
 */
// TODO: clean up when touching this next time
export class ThreeDEditorFullscreen extends ThreeDEditor {}
