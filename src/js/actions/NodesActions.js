import when from 'when';

import IronicApiErrorHandler from '../services/IronicApiErrorHandler';
import IronicApiService from '../services/IronicApiService';
import MistralApiService from '../services/MistralApiService';
import MistralApiErrorHandler from '../services/MistralApiErrorHandler';
import NodesConstants from '../constants/NodesConstants';
import NotificationActions from './NotificationActions';
import { getServiceUrl, getAuthTokenId } from '../services/utils';

export default {
  startOperation(workflowId) {
    return {
      type: NodesConstants.START_NODES_OPERATION
    };
  },

  finishOperation() {
    return {
      type: NodesConstants.FINISH_NODES_OPERATION
    };
  },

  requestNodes() {
    return {
      type: NodesConstants.REQUEST_NODES
    };
  },

  receiveNodes(nodes) {
    return {
      type: NodesConstants.RECEIVE_NODES,
      payload: nodes
    };
  },

  fetchNodes() {
    return (dispatch, getState) => {
      dispatch(this.requestNodes());
      const ironicUrl = getServiceUrl(getState(), 'ironic');
      const authTokenId = getAuthTokenId(getState());
      IronicApiService.getNodes(ironicUrl, authTokenId).then((response) => {
        return when.all(response.nodes.map((node) => {
          return IronicApiService.getNode(ironicUrl, authTokenId, node.uuid);
        }));
      }).then((nodes) => {
        dispatch(this.receiveNodes(nodes));
      }).catch((error) => {
        dispatch(this.receiveNodes([]));
        console.error('Error in NodesActions.fetchNodes', error); //eslint-disable-line no-console
        let errorHandler = new IronicApiErrorHandler(error);
        errorHandler.errors.forEach((error) => {
          NotificationActions.notify(error);
        });
      });
    };
  },

  introspectNodes() {
    return (dispatch, getState) => {
      dispatch(this.startOperation());
      const mistralUrl = getServiceUrl(getState(), 'mistral');
      const authTokenId = getAuthTokenId(getState());
      MistralApiService.runWorkflow(mistralUrl, authTokenId, 'tripleo.baremetal.bulk_introspect')
      .then((response) => {
        if(response.state === 'ERROR') {
          NotificationActions.notify({ title: 'Error', message: response.state_info });
          dispatch(this.finishOperation());
        } else {
          dispatch(this.pollForWorkflow(response.id));
        }
      }).catch((error) => {
        let errorHandler = new MistralApiErrorHandler(error);
        errorHandler.errors.forEach((error) => {
          NotificationActions.notify(error);
        });
        dispatch(this.finishOperation());
      });
    };
  },

  pollForWorkflow(workflowExecutionId) {
    return (dispatch, getState) => {
      const mistralUrl = getServiceUrl(getState(), 'mistral');
      const authTokenId = getAuthTokenId(getState());
      MistralApiService.getWorkflowExecution(mistralUrl, authTokenId, workflowExecutionId)
      .then((response) => {
        if(response.state === 'RUNNING') {
          dispatch(this.fetchNodes());
          setTimeout(() => dispatch(this.pollForWorkflow(workflowExecutionId)), 7000);
        } else if(response.state === 'ERROR') {
          NotificationActions.notify({ title: 'Error', message: response.state_info });
          dispatch(this.finishOperation());
        } else {
          dispatch(this.finishOperation());
          NotificationActions.notify({ type: 'success',
                                       title: 'Introspection finished',
                                       message: 'Nodes Introspection successfully finished' });
        }
      }).catch((error) => {
        let errorHandler = new MistralApiErrorHandler(error);
        errorHandler.errors.forEach((error) => {
          NotificationActions.notify(error);
        });
        dispatch(this.finishOperation());
      });
    };
  }

};
