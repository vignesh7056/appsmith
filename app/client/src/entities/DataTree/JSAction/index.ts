import { ENTITY_TYPE } from "entities/DataTree/DataTreeFactory";
import { JSCollectionData } from "reducers/entityReducers/jsActionsReducer";
import { EvaluationSubstitutionType } from "entities/DataTree/DataTreeFactory";
import { DependencyMap } from "utils/DynamicBindingUtils";
import { JSActionEntityConfig, JSActionEvalTree, MetaArgs } from "./types";

const reg = /this\./g;

export const generateDataTreeJSAction = (
  js: JSCollectionData,
): { dataTree: JSActionEvalTree; entityConfig: JSActionEntityConfig } => {
  const meta: Record<string, MetaArgs> = {};
  const dynamicBindingPathList = [];
  const bindingPaths: Record<string, EvaluationSubstitutionType> = {};
  const variableList: Record<string, any> = {};
  const variables = js.config.variables;
  const listVariables: Array<string> = [];
  dynamicBindingPathList.push({ key: "body" });

  const removeThisReference = js.config.body.replace(reg, `${js.config.name}.`);
  bindingPaths["body"] = EvaluationSubstitutionType.SMART_SUBSTITUTE;

  if (variables) {
    for (let i = 0; i < variables.length; i++) {
      const variable = variables[i];
      variableList[variable.name] = variable.value;
      listVariables.push(variable.name);
      dynamicBindingPathList.push({ key: variable.name });
      bindingPaths[variable.name] = EvaluationSubstitutionType.SMART_SUBSTITUTE;
    }
  }
  const dependencyMap: DependencyMap = {};
  dependencyMap["body"] = [];
  const actions = js.config.actions;
  const actionsData: Record<string, any> = {};
  if (actions) {
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      meta[action.name] = {
        arguments: action.actionConfiguration.jsArguments,
        isAsync: action.actionConfiguration.isAsync,
        confirmBeforeExecute: !!action.confirmBeforeExecute,
      };
      bindingPaths[action.name] = EvaluationSubstitutionType.SMART_SUBSTITUTE;
      dynamicBindingPathList.push({ key: action.name });
      dependencyMap["body"].push(action.name);
      actionsData[action.name] = {
        data: (js.data && js.data[`${action.id}`]) || {},
      };
    }
  }
  return {
    dataTree: {
      ...variableList,
      ...actionsData,
      ENTITY_TYPE: ENTITY_TYPE.JSACTION,
    },
    entityConfig: {
      name: js.config.name,
      actionId: js.config.id,
      pluginType: js.config.pluginType,
      ENTITY_TYPE: ENTITY_TYPE.JSACTION,
      body: removeThisReference,
      meta: meta,
      bindingPaths: bindingPaths, // As all js object function referred to as action is user javascript code, we add them as binding paths.
      reactivePaths: { ...bindingPaths },
      dynamicBindingPathList: dynamicBindingPathList,
      variables: listVariables,
      dependencyMap: dependencyMap,
    },
  };
};