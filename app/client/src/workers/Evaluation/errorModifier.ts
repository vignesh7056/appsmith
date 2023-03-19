import type { DataTree } from "entities/DataTree/dataTreeFactory";
import { getAllAsyncFunctions } from "@appsmith/workers/Evaluation/Actions";
import type { EvaluationError } from "utils/DynamicBindingUtils";
import { PropertyEvaluationErrorCategory } from "utils/DynamicBindingUtils";
import { klona } from "klona/full";

const FOUND_ASYNC_IN_SYNC_EVAL_MESSAGE =
  "Found an async invocation during evaluation. Sync fields cannot execute asynchronous code.";
const UNDEFINED_ACTION_IN_SYNC_EVAL_ERROR =
  "Found a reference to {{actionName}} during evaluation. Sync fields cannot execute framework actions. Please remove any direct/indirect references to {{actionName}} and try again.";
class ErrorModifier {
  private errorNamesToScan = ["ReferenceError", "TypeError"];
  // Note all regex below groups the async function name

  private asyncFunctionsNameMap: Record<string, true> = {};

  updateAsyncFunctions(dataTree: DataTree) {
    this.asyncFunctionsNameMap = getAllAsyncFunctions(dataTree);
  }

  run(error: Error) {
    const errorMessage = getErrorMessage(error);

    if (!this.errorNamesToScan.includes(error.name)) return errorMessage;

    for (const asyncFunctionFullPath of Object.keys(
      this.asyncFunctionsNameMap,
    )) {
      const functionNameWithWhiteSpace = " " + asyncFunctionFullPath + " ";
      if (getErrorMessageWithType(error).match(functionNameWithWhiteSpace)) {
        return {
          name: "ValidationError",
          message: UNDEFINED_ACTION_IN_SYNC_EVAL_ERROR.replaceAll(
            "{{actionName}}",
            asyncFunctionFullPath + "()",
          ),
        };
      }
    }

    return errorMessage;
  }
  modifyAsyncInvocationErrors(errors: EvaluationError[], asyncFunc: string) {
    return errors.map((error) => {
      const newError = Object.assign({}, error);
      if (isAsyncFunctionCalledInSyncFieldError(newError)) {
        newError.errorMessage.message = FOUND_ASYNC_IN_SYNC_EVAL_MESSAGE;
        newError.kind = {
          category:
            PropertyEvaluationErrorCategory.ASYNC_FUNCTION_INVOCATION_IN_DATA_FIELD,
          rootcause: asyncFunc,
        };
      }
      return newError;
    });
  }
}

export const errorModifier = new ErrorModifier();

const FOUND_PROMISE_IN_SYNC_EVAL_MESSAGE =
  "Found a Promise() during evaluation. Sync fields cannot execute asynchronous code.";

export class FoundPromiseInSyncEvalError extends Error {
  constructor() {
    super();
    this.name = "";
    this.message = FOUND_PROMISE_IN_SYNC_EVAL_MESSAGE;
  }
}

export class ActionCalledInSyncFieldError extends Error {
  constructor(actionName: string) {
    super(actionName);

    if (!actionName) {
      this.message = "Async function called in a sync field";
      return;
    }

    this.name = "";
    this.message = UNDEFINED_ACTION_IN_SYNC_EVAL_ERROR.replaceAll(
      "{{actionName}}",
      actionName + "()",
    );
  }
}

export const getErrorMessage = (error: Error) => {
  return error.name
    ? {
        name: error.name,
        message: error.message,
      }
    : {
        name: "ValidationError",
        message: error.message,
      };
};

export const getErrorMessageWithType = (error: Error) => {
  return error.name ? `${error.name}: ${error.message}` : error.message;
};

const ACTION_CALLED_IN_SYNC_FIELD_REGEX =
  /Found a reference to .+? during evaluation\. Sync fields cannot execute framework actions\. Please remove any direct\/indirect references to .+? and try again\./gm;

function isAsyncFunctionCalledInSyncFieldError(error: EvaluationError) {
  const isPromiseInSyncFields =
    error.errorMessage.message === FOUND_PROMISE_IN_SYNC_EVAL_MESSAGE;
  const isAsyncFunctionInSyncFields = ACTION_CALLED_IN_SYNC_FIELD_REGEX.test(
    error.errorMessage.message,
  );
  const isAsyncFunctionInvocationDefault =
    error.errorMessage.message === FOUND_ASYNC_IN_SYNC_EVAL_MESSAGE;
  console.log(
    {
      isPromiseInSyncFields,
      isAsyncFunctionInSyncFields,
      errorMessage: error.errorMessage.message,
    },
    "$$$",
  );
  return (
    isPromiseInSyncFields ||
    isAsyncFunctionInSyncFields ||
    isAsyncFunctionInvocationDefault
  );
}
