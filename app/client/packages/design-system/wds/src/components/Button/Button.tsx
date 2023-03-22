import React, { useMemo, forwardRef } from "react";
import { Text } from "../Text";
import { Spinner } from "../Spinner";
import { StyledButton } from "./index.styled";
import type { fontFamilyTypes } from "../../utils/typography";
import type {
  HeadlessButtonProps,
  HeadlessButtonRef,
} from "@design-system/headless";

export type ButtonVariants = "primary" | "secondary" | "tertiary";

export interface ButtonProps extends Omit<HeadlessButtonProps, "className"> {
  /**
   *  @default primary
   */
  variant?: ButtonVariants;
  children?: React.ReactNode;
  isDisabled?: boolean;
  isLoading?: boolean;
  fontFamily?: fontFamilyTypes;
}

export const WdsButton = forwardRef(
  (props: ButtonProps, ref: HeadlessButtonRef) => {
    const {
      children,
      fontFamily,
      isDisabled,
      isLoading,
      variant = "primary",
      ...rest
    } = props;

    const content = useMemo(() => {
      if (isLoading) return <Spinner />;

      return (
        children && (
          <Text data-component="text" fontFamily={fontFamily}>
            {children}
          </Text>
        )
      );
    }, [isLoading, children, fontFamily]);

    return (
      <StyledButton
        data-loading={isLoading}
        data-variant={variant}
        isDisabled={isDisabled}
        {...rest}
        ref={ref}
      >
        {content}
      </StyledButton>
    );
  },
);
