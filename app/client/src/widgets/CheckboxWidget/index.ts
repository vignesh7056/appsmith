import Widget from "./widget";
import IconSVG from "./icon.svg";
import { LabelPosition, ResponsiveBehavior } from "components/constants";
import { AlignWidgetTypes } from "widgets/constants";

export const CONFIG = {
  type: Widget.getWidgetType(),
  name: "Checkbox",
  iconSVG: IconSVG,
  needsMeta: true,
  searchTags: ["boolean"],
  defaults: {
    rows: 4,
    columns: 12,
    label: "Label",
    defaultCheckedState: true,
    widgetName: "Checkbox",
    version: 1,
    alignWidget: AlignWidgetTypes.LEFT,
    labelPosition: LabelPosition.Left,
    isDisabled: false,
    isRequired: false,
    animateLoading: true,
    responsiveBehavior: ResponsiveBehavior.Fill,
  },
  properties: {
    derived: Widget.getDerivedPropertiesMap(),
    default: Widget.getDefaultPropertiesMap(),
    meta: Widget.getMetaPropertiesMap(),
    config: Widget.getPropertyPaneConfig(),
    contentConfig: Widget.getPropertyPaneContentConfig(),
    styleConfig: Widget.getPropertyPaneStyleConfig(),
  },
};

export default Widget;
