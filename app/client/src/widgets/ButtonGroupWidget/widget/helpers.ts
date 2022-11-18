import { get } from "lodash";
import { ButtonGroupWidgetProps } from ".";

/**
 * this is a getter function to get stylesheet value of the property from the config
 *
 * @param props
 * @param propertyPath
 * @param widgetStylesheet
 * @returns
 */
export const getStylesheetValue = (
  props: ButtonGroupWidgetProps,
  propertyPath: string,
  widgetStylesheet?: Record<string, any>,
) => {
  const propertyName = propertyPath.split(".").slice(-1)[0];

  return get(widgetStylesheet, `childStylesheet.button.${propertyName}`, "");
};
