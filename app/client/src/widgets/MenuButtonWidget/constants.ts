import { WidgetProps } from "widgets/BaseWidget";
import { Alignment } from "@blueprintjs/core";
import { IconName } from "@blueprintjs/icons";
import {
  ButtonBorderRadius,
  ButtonVariant,
  ButtonPlacement,
} from "components/constants";
import { RenderMode } from "constants/WidgetConstants";

export enum MenuItemsSource {
  STATIC = "STATIC",
  DYNAMIC = "DYNAMIC",
}

export interface MenuButtonWidgetProps extends WidgetProps {
  label?: string;
  isDisabled?: boolean;
  isVisible?: boolean;
  isCompact?: boolean;
  menuItems: Record<
    string,
    {
      widgetId: string;
      id: string;
      index: number;
      isVisible?: boolean;
      isDisabled?: boolean;
      label?: string;
      backgroundColor?: string;
      textColor?: string;
      iconName?: IconName;
      iconColor?: string;
      iconAlign?: Alignment;
      onClick?: string;
    }
  >;
  menuVariant?: ButtonVariant;
  menuColor?: string;
  borderRadius: ButtonBorderRadius;
  boxShadow?: string;
  iconName?: IconName;
  iconAlign?: Alignment;
  placement?: ButtonPlacement;
  menuItemsSource: MenuItemsSource;
  configureMenuItems: {
    label: string;
    id: string;
    config: {
      id: string;
      label: any;
      isVisible: any;
      isDisabled: any;
      onClick?: string;
      backgroundColor?: string;
      textColor?: string;
      iconName?: IconName;
      iconColor?: string;
      iconAlign?: Alignment;
    };
  };
  sourceData?: Array<Record<string, unknown>>;
  sourceDataKeys?: Array<string>;
}

export interface MenuButtonComponentProps {
  label?: string;
  isDisabled?: boolean;
  isVisible?: boolean;
  isCompact?: boolean;
  menuItems: Record<
    string,
    {
      widgetId: string;
      id: string;
      index: number;
      isVisible?: boolean;
      isDisabled?: boolean;
      label?: string;
      backgroundColor?: string;
      textColor?: string;
      iconName?: IconName;
      iconColor?: string;
      iconAlign?: Alignment;
      onClick?: string;
    }
  >;
  menuVariant?: ButtonVariant;
  menuColor?: string;
  borderRadius: string;
  boxShadow?: string;
  iconName?: IconName;
  iconAlign?: Alignment;
  onItemClicked: (onClick: string | undefined, index: number) => void;
  backgroundColor?: string;
  placement?: ButtonPlacement;
  width: number;
  widgetId: string;
  menuDropDownWidth: number;
  renderMode?: RenderMode;
  menuItemsSource: MenuItemsSource;
  configureMenuItems: {
    label: string;
    id: string;
    config: {
      id: string;
      label: any;
      isVisible: any;
      isDisabled: any;
      onClick?: string;
      backgroundColor?: string;
      textColor?: string;
      iconName?: IconName;
      iconColor?: string;
      iconAlign?: Alignment;
    };
  };
  sourceData?: Array<Record<string, unknown>>;
  sourceDataKeys?: Array<string>;
}

export interface PopoverContentProps {
  menuItems: Record<
    string,
    {
      widgetId: string;
      id: string;
      index: number;
      isVisible?: boolean;
      isDisabled?: boolean;
      label?: string;
      backgroundColor?: string;
      textColor?: string;
      iconName?: IconName;
      iconColor?: string;
      iconAlign?: Alignment;
      onClick?: string;
    }
  >;
  onItemClicked: (onClick: string | undefined, index: number) => void;
  isCompact?: boolean;
  borderRadius?: string;
  backgroundColor?: string;
  menuItemsSource: MenuItemsSource;
  configureMenuItems: {
    label: string;
    id: string;
    config: {
      id: string;
      label: any;
      isVisible: any;
      isDisabled: any;
      onClick?: string;
      backgroundColor?: string;
      textColor?: string;
      iconName?: IconName;
      iconColor?: string;
      iconAlign?: Alignment;
    };
  };
  sourceData?: Array<Record<string, unknown>>;
  sourceDataKeys?: Array<string>;
}
