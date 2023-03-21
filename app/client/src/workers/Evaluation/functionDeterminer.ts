import { addDataTreeToContext } from "@appsmith/workers/Evaluation/Actions";
import type { EvalContext } from "./evaluate";
import type { DataTree } from "entities/DataTree/dataTreeFactory";
import userLogs from "./fns/overrides/console";
import ExecutionMetaData from "./fns/utils/ExecutionMetaData";

class FunctionDeterminer {
  private evalContext: EvalContext = {};

  setupEval(dataTree: DataTree) {
    /**** Setting the eval context ****/
    const evalContext: EvalContext = {
      $isDataField: true,
      $isAsync: false,
    };

    ExecutionMetaData.setExecutionMetaData({
      jsVarUpdateTrackingDisabled: true,
    });

    addDataTreeToContext({
      dataTree,
      EVAL_CONTEXT: evalContext,
      isTriggerBased: true,
      enableJSFnPostProcessors: false,
    });

    // Set it to self so that the eval function can have access to it
    // as global data. This is what enables access all appsmith
    // entity properties from the global context
    Object.assign(self, evalContext);

    this.evalContext = evalContext;
    userLogs.disable();
  }

  close() {
    userLogs.enable();
    ExecutionMetaData.setExecutionMetaData({
      jsVarUpdateTrackingDisabled: false,
    });
  }

  isFunctionAsync(userFunction: unknown, logs: unknown[] = []) {
    self["$isDataField"] = true;
    self["$isAsync"] = false;

    return (function () {
      try {
        if (typeof userFunction === "function") {
          if (userFunction.constructor.name === "AsyncFunction") {
            // functions declared with an async keyword
            self["$isAsync"] = true;
          } else {
            const returnValue = userFunction();
            if (!!returnValue && returnValue instanceof Promise) {
              self["$isAsync"] = true;
            }
          }
        }
      } catch (e) {
        // We do not want to throw errors for internal operations, to users.
        // logLevel should help us in debugging this.
        logs.push({ error: "Error when determining async function " + e });
      }
      const isAsync = !!self["$isAsync"];

      return isAsync;
    })();
  }
}

export const functionDeterminer = new FunctionDeterminer();
