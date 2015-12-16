import * as _ from 'lodash';
import ClassNames from 'classnames';
import Formsy from 'formsy-react';
import { Link } from 'react-router';
import React from 'react';

import RegisterNodeForm from './RegisterNodeForm';
import Tab from '../ui/Tab';

export default class RegisterNodesDialog extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      nodesToRegister: [],
      selectedNode: undefined,
      canSubmit: false,
      formErrors: []
    };
  }

  onNodeChange (currentValues, isChanged) {
    // For some reason this fn is getting called on a dispatch fake browser event... /sigh
    if (!arguments && arguments.length !== 2) {
      return;
    }

    if (isChanged) {
      let selectedNode = this.state.selectedNode;
      selectedNode.ipAddress = currentValues.ipAddress;
      selectedNode.driver = currentValues.driver;
      selectedNode.ipmiUsername = currentValues.ipmiUsername;
      selectedNode.ipmiPassword = currentValues.ipmiPassword;
      selectedNode.nicMacAddress = currentValues.nicMacAddress;
      this.setState({selectedNode: selectedNode});
    }
  }

  onFormSubmit (formData, resetForm, invalidateForm) {
    // TODO: Make call to register nodes
  }

  checkCanSubmit () {
    let nodesToRegister = this.state.nodesToRegister;
    let invalid = _.find(nodesToRegister, function(node) {
      return node.valid === false;
    });
    this.setState({canSubmit: invalid === undefined});
  }

  onFormValid () {
    let selectedNode = this.state.selectedNode;
    selectedNode.valid = true;
    this.checkCanSubmit();
  }

  onFormInvalid () {
    let selectedNode = this.state.selectedNode;
    selectedNode.valid = false;
    this.setState({canSubmit: false});
  }


  getCSVFileInput () {
    return document.getElementById('regNodesUploadFileInput');
  }

  parseResults (e) {
    // TODO: Parse the CSV file results and add nodes to the list of nodes to register and validate
  }

  handleParseError (e) {
    // TODO: Notification ?
  }

  csvFileChosen () {
    var fileInput = this.getCSVFileInput();
    var file = fileInput.files[0];

    if (file) {
      var reader = new FileReader();
      reader.onload = this.parseResults.bind(this);
      reader.onloadend = this.handleParseError.bind(this);
      reader.readAsText(file);
    }
  }

  uploadCsvFile () {
    // Auto click the 'Chose Files' button, this gives us a single click upload button
    var uploadfile = this.getCSVFileInput();
    uploadfile.click();
  }

  addNode () {
    // Create a node with defaults
    var newNode = {
      driver: 'pxe_ipmitool',
      ipAddress: '',
      ipmiUsername: '',
      ipmiPassword: '',
      nicMacAddress: '',
      valid: false
    };

    // Add the new node to  list of nodes
    var nodesToRegister = this.state.nodesToRegister.slice(0);
    nodesToRegister.push(newNode);

    // Update the state
    this.setState({nodesToRegister: nodesToRegister, selectedNode: newNode, canSubmit: false});
  }

  removeNode (node) {
    var nodesToRegister = this.state.nodesToRegister;
    nodesToRegister.splice(nodesToRegister.indexOf(node), 1);
    this.setState({nodesToRegister: nodesToRegister, selectedNode: nodesToRegister[0]});
  }

  updateNodeSelection (node) {
    this.setState({selectedNode: node});
  }

  renderNode (node, index) {
    let nodeName = node.ipAddress || 'Undefined Node';
    let validationIconClasses = ClassNames({
      'pficon': true,
      'pficon-error-circle-o': !node.valid
    });

    return (
      <Tab key={index} isActive={node == this.state.selectedNode}>
        <a className="link" onClick={this.updateNodeSelection.bind(this, node)}>
          <span className={validationIconClasses}/> {index} {nodeName}
          <span className="fa fa-trash-o remove-node" onClick={this.removeNode.bind(this, node)}/>
        </a>
      </Tab>);
  }

  renderNodeTabs () {
    let renderNode = this.renderNode.bind(this);
    return this.state.nodesToRegister.map(function(node, i) {
      return renderNode(node, i);
    });
  }

  render() {
    return (
      <div>
        <div className="modal modal-routed in" role="dialog">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <Formsy.Form ref="RegisterNodesForm"
                           role="form"
                           className="form-horizontal"
                           onChange={this.onNodeChange.bind(this)}
                           onValidSubmit={this.onFormSubmit.bind(this)}
                           onValid={this.onFormValid.bind(this)}
                           onInvalid={this.onFormInvalid.bind(this)}>
                <div className="modal-header">
                  <Link to="/nodes/registered"
                        type="button"
                        className="close">
                    <span className="pficon pficon-close"></span>
                  </Link>
                  <h4 className="modal-title">Register Nodes</h4>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-xs-5">
                      <div className="nav-stacked-actions">
                        <button className="btn btn-default"
                                onClick={this.addNode.bind(this)}>
                          <span className="fa fa-plus"/> Add New
                        </button>
                        &nbsp; or &nbsp;
                        <button className="btn btn-default"
                                onClick={this.uploadCsvFile.bind(this)}
                                type="button">
                          <span className="fa fa-upload"/> Upload From CSV
                        </button>
                        <input style={{display: 'none'}}
                               id="regNodesUploadFileInput"
                               type="file" accept='text/csv'
                               onChange={this.csvFileChosen.bind(this)}/>
                      </div>
                      <ul className="nav nav-pills nav-stacked nav-arrows">
                        {this.renderNodeTabs().reverse()}
                      </ul>
                    </div>
                    <div className="col-xs-7">
                      <div className="tab-content">
                        <RegisterNodeForm selectedNode={this.state.selectedNode} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <Link to="/nodes/registered"
                        type="button"
                        className="btn btn-default">Cancel</Link>
                  <button disabled={!this.state.canSubmit}
                          className="btn btn-primary"
                          type="submit">
                    Register Nodes
                  </button>
                </div>
              </Formsy.Form>
            </div>
          </div>
        </div>
        <div className="modal-backdrop in"></div>
      </div>
    );
  }
}
