import React from "react";
import { connect } from "react-redux";
import { submit, initialize, getFormValues } from "redux-form";
import ApiEditorForm from "../../components/forms/ApiEditorForm";
import {
  createAction,
  runAction,
  deleteAction,
  updateAction,
} from "../../actions/actionActions";
import { RestAction } from "../../api/ActionAPI";
import { AppState } from "../../reducers";
import { RouteComponentProps } from "react-router";
import { API_EDITOR_URL } from "../../constants/routes";
import { API_EDITOR_FORM_NAME } from "../../constants/forms";
import { ResourceDataState } from "../../reducers/entityReducers/resourcesReducer";
import { fetchResources } from "../../actions/resourcesActions";

interface ReduxStateProps {
  actions: RestAction[];
  response: any;
  formData: any;
  resources: ResourceDataState;
}
interface ReduxActionProps {
  submitForm: (name: string) => void;
  createAction: (values: RestAction) => void;
  runAction: (id: string) => void;
  deleteAction: (id: string) => void;
  updateAction: (data: RestAction) => void;
  initialize: (formName: string, data?: Partial<RestAction>) => void;
  fetchResources: () => void;
}

type Props = ReduxActionProps &
  ReduxStateProps &
  RouteComponentProps<{ id: string }>;

class ApiEditor extends React.Component<Props> {
  componentDidMount(): void {
    if (!this.props.resources.list.length) {
      this.props.fetchResources();
    }
    const currentId = this.props.match.params.id;
    if (!currentId) return;
    if (!this.props.actions.length) {
      this.props.history.push(API_EDITOR_URL);
      return;
    }
    const data = this.props.actions.filter(
      action => action.id === currentId,
    )[0];
    this.props.initialize(API_EDITOR_FORM_NAME, data);
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const currentId = this.props.match.params.id;
    if (currentId && currentId !== prevProps.match.params.id) {
      const data = this.props.actions.filter(
        action => action.id === currentId,
      )[0];
      this.props.initialize(API_EDITOR_FORM_NAME, data);
    }
  }

  handleSubmit = (values: RestAction) => {
    const { formData } = this.props;
    const data: RestAction = {
      ...formData,
      actionConfiguration: {
        ...formData.actionConfiguration,
        body: formData.actionConfiguration.body
          ? typeof formData.actionConfiguration.body === "string"
            ? JSON.parse(formData.actionConfiguration.body)
            : formData.actionConfiguration.body
          : null,
      },
    };
    if (data.id) {
      this.props.updateAction(data);
    } else {
      this.props.createAction(data);
    }
  };

  handleSaveClick = () => {
    this.props.submitForm(API_EDITOR_FORM_NAME);
  };
  handleDeleteClick = () => {
    this.props.deleteAction(this.props.match.params.id);
  };
  handleRunClick = () => {
    this.props.runAction(this.props.match.params.id);
  };

  render() {
    return (
      <ApiEditorForm
        onSubmit={this.handleSubmit}
        onSaveClick={this.handleSaveClick}
        onDeleteClick={this.handleDeleteClick}
        onRunClick={this.handleRunClick}
        response={this.props.response}
      />
    );
  }
}

const mapStateToProps = (state: AppState): ReduxStateProps => ({
  actions: state.entities.actions.data,
  response: state.entities.actions.response,
  formData: getFormValues(API_EDITOR_FORM_NAME)(state),
  resources: state.entities.resources,
});

const mapDispatchToProps = (dispatch: any): ReduxActionProps => ({
  submitForm: (name: string) => dispatch(submit(name)),
  createAction: (action: RestAction) => dispatch(createAction(action)),
  runAction: (id: string) => dispatch(runAction({ id })),
  deleteAction: (id: string) => dispatch(deleteAction({ id })),
  updateAction: (data: RestAction) => dispatch(updateAction({ data })),
  initialize: (formName: string, data?: Partial<RestAction>) =>
    dispatch(initialize(formName, data)),
  fetchResources: () => dispatch(fetchResources()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ApiEditor);
