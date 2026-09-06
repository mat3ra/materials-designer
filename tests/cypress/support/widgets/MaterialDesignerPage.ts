import { appPath } from "../app";
import MaterialDesignerWidget from "./MaterialDesignerWidget";
import Page from "./Page";

const wrapper = "#materials-designer";

export default class MaterialDesignerPage extends Page {
    designerWidget: MaterialDesignerWidget;

    /** v1 at /, MD 2.0 at /v2.html until the flip makes them the same page. */
    url = appPath();

    constructor() {
        super(wrapper);
        this.designerWidget = new MaterialDesignerWidget(wrapper);
    }
}
