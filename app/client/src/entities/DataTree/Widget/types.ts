import { ENTITY_TYPE, EvaluationSubstitutionType } from "../DataTreeFactory";
import {
  PrivateWidgets,
  WidgetConfig,
  WidgetEvalProps,
  WidgetProps,
} from "widgets/BaseWidget";
import { ValidationConfig } from "constants/PropertyControlConstants";

/**
 *  Map of overriding property as key and overridden property as values
 */
export type OverridingPropertyPaths = Record<string, string[]>;

export enum OverridingPropertyType {
  META = "META",
  DEFAULT = "DEFAULT",
}
/**
 *  Map of property name as key and value as object with defaultPropertyName and metaPropertyName which it depends on.
 */
export type PropertyOverrideDependency = Record<
  string,
  {
    DEFAULT: string | undefined;
    META: string | undefined;
  }
>;

export interface WidgetEntityConfig extends WidgetConfig {
  bindingPaths: Record<string, EvaluationSubstitutionType>;
  reactivePaths: Record<string, EvaluationSubstitutionType>;
  triggerPaths: Record<string, boolean>;
  validationPaths: Record<string, ValidationConfig>;
  ENTITY_TYPE: ENTITY_TYPE.WIDGET;

  logBlackList: Record<string, true>;
  privateWidgets: PrivateWidgets;

  propertyOverrideDependency: PropertyOverrideDependency;
  overridingPropertyPaths: OverridingPropertyPaths;
  meta: Record<string, unknown>;

  defaultMetaProps: Array<string>;

  type: string;
}

export type DataTreeWidget = WidgetProps | WidgetConfig;

export interface WidgetEvalTree extends WidgetEvalProps {
  ENTITY_TYPE: ENTITY_TYPE.WIDGET;
}