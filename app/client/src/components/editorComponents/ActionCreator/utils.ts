import { FUNC_ARGS_REGEX } from "./regex";
import { getDynamicBindings } from "utils/DynamicBindingUtils";
import { isValidURL } from "utils/URLUtils";
import {
  getTextArgumentAtPosition,
  getEnumArgumentAtPosition,
  getModalName,
  setModalName,
  setEnumArgumentAtPosition,
  setCallbackFunctionField,
  getFuncExpressionAtPosition,
  getFunctionBodyStatements,
  setObjectAtPosition,
  getThenCatchBlocksFromQuery,
  setThenBlockInQuery,
  setCatchBlockInQuery,
  getFunctionParams,
  setQueryParam,
  getQueryParam,
  checkIfCatchBlockExists,
  checkIfThenBlockExists,
} from "@shared/ast";
import type { TreeDropdownOption } from "design-system-old";
import type { TActionBlock } from "./types";
import { AppsmithFunction } from "./constants";
import { FIELD_GROUP_CONFIG } from "./FieldGroup/FieldGroupConfig";

export const stringToJS = (string: string): string => {
  const { jsSnippets, stringSegments } = getDynamicBindings(string);
  return stringSegments
    .map((segment, index) => {
      if (jsSnippets[index] && jsSnippets[index].length > 0) {
        return jsSnippets[index];
      } else {
        return `'${segment.replace(/\n/g, "\\n").replace(/'/g, "\\'")}'`;
      }
    })
    .join(" + ");
};

export const JSToString = (js: string): string => {
  const segments = js.split(" + ");
  return segments
    .map((segment) => {
      if (segment.charAt(0) === "'") {
        return segment.substring(1, segment.length - 1);
      } else return "{{" + segment + "}}";
    })
    .join("");
};

export const argsStringToArray = (funcArgs: string): string[] => {
  const argsplitMatches = [...funcArgs.matchAll(FUNC_ARGS_REGEX)];
  const arr: string[] = [];
  let isPrevUndefined = true;
  for (const match of argsplitMatches) {
    const matchVal = match[0];
    if (!matchVal || matchVal === "") {
      if (isPrevUndefined) {
        arr.push(matchVal);
      }
      isPrevUndefined = true;
    } else {
      isPrevUndefined = false;
      arr.push(matchVal);
    }
  }
  return arr;
};

export const modalSetter = (changeValue: any, currentValue: string) => {
  // requiredValue is value minus the surrounding {{ }}
  // eg: if value is {{download()}}, requiredValue = download()
  const requiredValue = getCodeFromMoustache(currentValue);
  try {
    return setModalName(requiredValue, changeValue, self.evaluationVersion);
  } catch (e) {
    // showError();
    throw e;
  }
};

export const modalGetter = (value: string) => {
  // requiredValue is value minus the surrounding {{ }}
  // eg: if value is {{download()}}, requiredValue = download()
  const requiredValue = getCodeFromMoustache(value);
  return getModalName(requiredValue, self.evaluationVersion);
};

export const objectSetter = (
  changeValue: any,
  currentValue: string,
  argNum: number,
): string => {
  const requiredValue = getCodeFromMoustache(currentValue);
  const changeValueWithoutBraces = getCodeFromMoustache(changeValue);
  try {
    return setObjectAtPosition(
      requiredValue,
      changeValueWithoutBraces,
      argNum,
      self.evaluationVersion,
    );
  } catch (e) {
    // showError();
    return currentValue;
  }
};

export const textSetter = (
  changeValue: any,
  currentValue: string,
  argNum: number,
): string => {
  const requiredValue = stringToJS(currentValue);
  const changeValueWithoutBraces = getCodeFromMoustache(
    stringToJS(changeValue),
  );
  try {
    return `{{${setCallbackFunctionField(
      requiredValue,
      changeValueWithoutBraces,
      argNum,
      self.evaluationVersion,
    )}}}`;
  } catch (e) {
    return currentValue;
  }
};

export const textGetter = (value: string, argNum: number): string => {
  // requiredValue is value minus the surrounding {{ }}
  // eg: if value is {{download()}}, requiredValue = download()
  const requiredValue = stringToJS(value);
  return getTextArgumentAtPosition(
    requiredValue,
    argNum,
    self.evaluationVersion,
  );
};

export const enumTypeSetter = (
  changeValue: any,
  currentValue: string,
  argNum: number,
): string => {
  // requiredValue is value minus the surrounding {{ }}
  // eg: if value is {{download()}}, requiredValue = download()
  const requiredValue = getDynamicBindings(currentValue).jsSnippets[0];
  try {
    return setEnumArgumentAtPosition(
      requiredValue,
      changeValue,
      argNum,
      self.evaluationVersion,
    );
  } catch (e) {
    return currentValue;
  }
};

export const enumTypeGetter = (
  value: string,
  argNum: number,
  defaultValue = "",
): string => {
  // requiredValue is value minus the surrounding {{ }}
  // eg: if value is {{download()}}, requiredValue = download()
  const requiredValue = getDynamicBindings(value).jsSnippets[0];
  return getEnumArgumentAtPosition(
    requiredValue,
    argNum,
    defaultValue,
    self.evaluationVersion,
  );
};

export const callBackFieldSetter = (
  changeValue: any,
  currentValue: string,
  argNum: number,
): string => {
  const requiredValue = getCodeFromMoustache(currentValue);
  const requiredChangeValue = getCodeFromMoustache(changeValue) || "() => {}";
  try {
    return `{{${
      setCallbackFunctionField(
        requiredValue,
        requiredChangeValue,
        argNum,
        self.evaluationVersion,
      ) || currentValue
    }}}`;
  } catch (e) {
    // showError();
    // throw e;
    return currentValue;
  }
};

export const callBackFieldGetter = (value: string, argNumber = 0) => {
  const requiredValue = getCodeFromMoustache(value);
  const funcExpr = getFuncExpressionAtPosition(
    requiredValue,
    argNumber,
    self.evaluationVersion,
  );
  return `{{${funcExpr}}}`;
};

/*
 * This function extracts the 1st string argument from value
 * and determines if the string is a valid url
 */
export const isValueValidURL = (value: string) => {
  if (value) {
    const indices = [];
    for (let i = 0; i < value.length; i++) {
      if (value[i] === "'") {
        indices.push(i);
      }
    }
    const str = value.substring(indices[0], indices[1] + 1);
    return isValidURL(str);
  }
};

export function flattenOptions(
  options: TreeDropdownOption[],
  results: TreeDropdownOption[] = [],
): TreeDropdownOption[] {
  options.forEach((option) => {
    results.push(option);
    if (option.children) {
      flattenOptions(option.children, results);
    }
  });
  return results;
}

export function getSelectedFieldFromValue(
  value: string,
  fieldOptions: TreeDropdownOption[],
): TreeDropdownOption {
  const allOptions = flattenOptions(fieldOptions);

  const includedFields = allOptions.filter((option) => {
    return value.includes(option.value);
  });

  const matches = includedFields.map((option) => ({
    option,
    index: value.indexOf(option.value),
  }));

  const sortedMatches = matches.sort((a, b) => a.index - b.index);

  const selectedField = sortedMatches[0]?.option;

  const noActionFieldConfig = FIELD_GROUP_CONFIG[AppsmithFunction.none];
  const noActionOption: TreeDropdownOption = {
    label: noActionFieldConfig.label,
    value: noActionFieldConfig.value || "",
    children: noActionFieldConfig.children,
  };

  return selectedField || noActionOption;
}

export function codeToAction(
  code: string,
  fieldOptions: TreeDropdownOption[],
  multipleActions = true,
  strict = false,
): TActionBlock {
  const jsCode = getCodeFromMoustache(code);

  const selectedOption = getSelectedFieldFromValue(jsCode, fieldOptions);

  const mainActionType = (selectedOption.type ||
    selectedOption.value ||
    AppsmithFunction.none) as any;

  if (strict) {
    if (mainActionType === AppsmithFunction.none) {
      throw new Error("Invalid action detected");
    }
  }

  if (chainableFns.includes(mainActionType) && multipleActions) {
    const successCallback = getFuncExpressionAtPosition(
      jsCode,
      0,
      self.evaluationVersion,
    );
    const { catch: catchBlock, then: thenBlock } = getThenCatchBlocksFromQuery(
      code,
      self.evaluationVersion,
    );

    const thenCallbackParams: string[] = getFunctionParams(thenBlock);
    const thenCallbackBlocks = getFunctionBodyStatements(
      thenBlock,
      self.evaluationVersion,
    );

    const catchCallbackParams: string[] = getFunctionParams(catchBlock);
    const catchCallbackBlocks = getFunctionBodyStatements(
      catchBlock,
      self.evaluationVersion,
    );

    const successCallbackParams: string[] = getFunctionParams(successCallback);
    const successCallbackBlocks: string[] = getFunctionBodyStatements(
      successCallback,
      self.evaluationVersion,
    ).map((block: string) => block);

    const errorCallback = getFuncExpressionAtPosition(
      jsCode,
      1,
      self.evaluationVersion,
    );

    const errorCallbackParams: string[] = getFunctionParams(errorCallback);
    const errorCallbackBlocks = getFunctionBodyStatements(
      errorCallback,
      self.evaluationVersion,
    ).map((block: string) => block);

    return {
      code: jsCode,
      actionType: mainActionType,
      success: {
        params: [...thenCallbackParams, ...successCallbackParams],
        blocks: [
          ...successCallbackBlocks.map((block: string) => ({
            ...codeToAction(block, fieldOptions, false, strict),
            type: "success" as const,
          })),
          ...thenCallbackBlocks.map((block: string) => ({
            ...codeToAction(block, fieldOptions, false, strict),
            type:
              successCallbackBlocks.length + errorCallbackBlocks.length > 0
                ? ("success" as const)
                : ("then" as const),
          })),
        ],
      },
      error: {
        params: [...catchCallbackParams, ...errorCallbackParams],
        blocks: [
          ...errorCallbackBlocks.map((block: string) => ({
            ...codeToAction(block, fieldOptions, false, strict),
            type: "failure" as const,
          })),
          ...catchCallbackBlocks.map((block: string) => ({
            ...codeToAction(block, fieldOptions, false, strict),
            type:
              successCallbackBlocks.length + errorCallbackBlocks.length > 0
                ? ("failure" as const)
                : ("catch" as const),
          })),
        ],
      },
    };
  }

  return {
    code: jsCode,
    actionType: mainActionType,
    success: { blocks: [] },
    error: { blocks: [] },
  };
}

export const chainableFns: TActionBlock["actionType"][] = [
  AppsmithFunction.integration,
  AppsmithFunction.navigateTo,
  AppsmithFunction.showAlert,
  AppsmithFunction.showModal,
  AppsmithFunction.closeModal,
  AppsmithFunction.storeValue,
  AppsmithFunction.clearStore,
  AppsmithFunction.removeValue,
  AppsmithFunction.copyToClipboard,
  AppsmithFunction.resetWidget,
  AppsmithFunction.showModal,
  AppsmithFunction.download,
];

export function actionToCode(
  action: TActionBlock,
  multipleActions = true,
): string {
  const {
    actionType,
    code,
    error: { blocks: errorBlocks, params: errorParams },
    success: { blocks: successBlocks, params: successParams },
  } = action;

  const actionFieldConfig = FIELD_GROUP_CONFIG[actionType];

  if (!actionFieldConfig) {
    return code;
  }

  if (chainableFns.includes(actionType as any) && multipleActions) {
    const existingSuccessCallback = getFuncExpressionAtPosition(code, 0, 2);
    const existingErrorCallback = getFuncExpressionAtPosition(code, 1, 2);
    const thenBlockExists = checkIfCatchBlockExists(code);
    const catchBlockExists = checkIfThenBlockExists(code);
    if (actionType === AppsmithFunction.integration) {
      if (existingSuccessCallback || existingErrorCallback) {
        successBlocks.forEach((block) => {
          if (block.type === "then") {
            block.type = "success";
          }
        });
        errorBlocks.forEach((block) => {
          if (block.type === "catch") {
            block.type = "failure";
          }
        });
      }
    }

    const successCallbackCodes = successBlocks
      .filter(
        ({ actionType, type }) =>
          actionType !== AppsmithFunction.none && type === "success",
      )
      .map((callback) => actionToCode(callback, false));
    const successCallbackCode = successCallbackCodes.join("");

    const thenCallbackCodes = successBlocks
      .filter(
        ({ actionType, type }) =>
          actionType !== AppsmithFunction.none && type === "then",
      )
      .map((callback) => actionToCode(callback, false));
    const thenCallbackCode = thenCallbackCodes.join("");

    const errorCallbackCodes = errorBlocks
      .filter(
        ({ actionType, type }) =>
          actionType !== AppsmithFunction.none && type === "failure",
      )
      .map((callback) => actionToCode(callback, false));
    const errorCallbackCode = errorCallbackCodes.join("");

    const catchCallbackCodes = errorBlocks
      .filter(
        ({ actionType, type }) =>
          actionType !== AppsmithFunction.none && type === "catch",
      )
      .map((callback) => actionToCode(callback, false));
    const catchCallbackCode = catchCallbackCodes.join("");

    // Set callback function field only if there is a callback code
    const withSuccessCallback =
      existingSuccessCallback || existingErrorCallback
        ? setCallbackFunctionField(
            code,
            `(${
              successParams ? successParams.join(",") : ""
            }) => { ${successCallbackCode} }`,
            0,
            self.evaluationVersion,
          )
        : code;

    const withThenCallback =
      thenBlockExists || thenCallbackCode
        ? setThenBlockInQuery(
            withSuccessCallback,
            `(${
              successParams ? successParams.join(",") : ""
            }) => { ${thenCallbackCode} }`,
            self.evaluationVersion,
          )
        : withSuccessCallback;

    // Set callback function field only if there is a callback code
    const withErrorCallback =
      existingSuccessCallback || existingErrorCallback
        ? setCallbackFunctionField(
            withThenCallback,
            `(${
              errorParams ? errorParams.join(",") : ""
            }) => { ${errorCallbackCode} }`,
            1,
            self.evaluationVersion,
          )
        : withThenCallback;

    const withCatchCallback =
      catchBlockExists || catchCallbackCode
        ? setCatchBlockInQuery(
            withErrorCallback,
            `(${
              errorParams ? errorParams.join(",") : ""
            }) => { ${catchCallbackCode} }`,
            self.evaluationVersion,
          )
        : withErrorCallback;

    return withCatchCallback;
  }

  return code === "" || code.endsWith(";") ? code : code + ";";
}

export function isEmptyBlock(block: string) {
  return [";", "undefined;", ""].includes(getCodeFromMoustache(block));
}

/** {{Hello {{Input.text}}}} -> Hello {{Input.text}} */
export function getCodeFromMoustache(value = "") {
  const code = value.replace(/^{{|}}$/g, "");
  return code;
}

export function paramSetter(
  changeValue: string,
  currentValue: string,
  argNum?: number,
) {
  argNum = argNum || 0;
  const requiredValue = getCodeFromMoustache(currentValue);
  const changeValueWithoutBraces = getCodeFromMoustache(changeValue);
  return setQueryParam(requiredValue, changeValueWithoutBraces, argNum);
}

export function paramGetter(code: string, argNum?: number) {
  argNum = argNum || 0;
  const requiredValue = getCodeFromMoustache(code);
  return getQueryParam(requiredValue, argNum);
}
