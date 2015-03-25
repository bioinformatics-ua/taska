'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import WorkflowActions from '../../actions/WorkflowActions.jsx';
import WorkflowStore from '../../stores/WorkflowStore.jsx';

import Griddle from 'griddle-react';

import {Loading, Modal} from './component.jsx'
import {TableComponentMixin, LayeredComponentMixin} from '../../mixins/component.jsx';

var ButtonWithDialog = React.createClass({
  mixins: [LayeredComponentMixin],
    success(e){
      this.props.success(this.props.identificator);
    },
    render: function() {
        return <button className="btn btn-danger" onClick={this.handleClick}><i className="fa fa-times"></i></button>;
    },
    renderLayer: function() {
        if (this.state.clicked) {
            return <Modal title={this.props.title} message={this.props.message} success={this.success} close={this.handleClose} />
        } else {
            return <span />;
        }
    },
    // {{{
    handleClose: function() {
        this.setState({ clicked: false });
    },
  handleClick: function() {
    this.setState({ clicked: !this.state.clicked });
  },
  getInitialState: function() {
    return { clicked: false };
  }
  // }}}
});

const WorkflowManage = React.createClass({
  delete(row){
    console.log('DELETE '+row.hash)
  },
  render: function(){
    const row = this.props.rowData;
    const object = {object: row.hash}
    return <div className="btn-group" role="group" aria-label="...">
            <Link className="btn btn-primary" to="Workflow" params={object}><i className="fa fa-play"></i></Link>
            <Link className="btn btn-warning" to="Workflow" params={object}><i className="fa fa-pencil"></i></Link>
            <ButtonWithDialog
              success={this.delete}
              identificator = {row}
              title={`Delete '${row.title}'`}
              message={`Are you sure you want to delete  '${row.title} ?'`}  />
           </div>;
  }
});

const WorkflowLink = React.createClass({
  render: function(){
    const row = this.props.rowData;
    const object = {object: row.hash}
    return <small>
            <Link to="Workflow" params={object}>{row.title}</Link>
           </small>;
  }
});


const WorkflowTable = React.createClass({
    tableAction: WorkflowActions.load,
    tableStore: WorkflowStore,
    mixins: [Reflux.listenTo(WorkflowStore, 'update'), TableComponentMixin],
    getInitialState: function() {
        return {};
    },
    update: function(data){
        this.setState(this.getState());
    },
  render: function () {
    const columnMeta = [
      {
      "columnName": "title",
      "order": 1,
      "locked": false,
      "visible": true,
      "customComponent": WorkflowLink,
      "displayName": "Title"
      },
      {
      "columnName": "hash",
      "order": 2,
      "locked": true,
      "visible": true,
      "customComponent": WorkflowManage,
      "cssClassName": "manage-td",
      "displayName": " "
      }
    ];
    return  <div className="panel panel-default panel-overflow">
              <div className="panel-heading">
                <i className="fa fa-cogs pull-left"></i>
                <h3 style={{position: 'absolute', width: '95%'}} className="text-center panel-title">My Studies</h3>
                <Link to="Workflow" params={{object: 'add'}} className="pull-right btn btn-xs btn-success"><i className="fa fa-plus"></i></Link>
              </div>
              <Griddle
                  {...this.commonTableSettings()}
                  columns={["title", "hash"]}
                  columnMetadata={columnMeta} />
            </div>;
  }

});

export default {WorkflowTable}
