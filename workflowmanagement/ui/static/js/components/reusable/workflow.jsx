'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import WorkflowActions from '../../actions/WorkflowActions.jsx';
import WorkflowStore from '../../stores/WorkflowStore.jsx';

import Griddle from 'griddle-react';

import {Loading, DeleteButton} from './component.jsx'
import {TableComponentMixin} from '../../mixins/component.jsx';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';

const WorkflowManage = React.createClass({
  delete(row){
    WorkflowActions.deleteWorkflow(row.hash);
  },
  render: function(){
    const user = this.props.metadata.user;
    const row = this.props.rowData;
    const object = {object: row.hash, mode: 'edit'};
    const object2 = {object: row.hash, mode: 'run'};
    return <div className="pull-right" role="group" aria-label="...">


            <div className="user-owned">{user && user.id === row.owner ?
                <i title="You are the creator of this Study Template, and are authorized to edit it." className="fa fa-2x fa-user"></i>
            :''}</div>
            <Link className="btn btn-sm btn-default" to="Workflow"
              params={object2}><i className="fa fa-search"></i></Link>
            {/*<Link className="btn btn-sm btn-primary" to="WorkflowEdit"
              params={object2}><i className="fa fa-play"></i></Link>

            {user && user.id === row.owner ?
              <Link className="btn btn-sm btn-warning" to="WorkflowEdit"
              params={object}><i className="fa fa-pencil"></i></Link>
            :''} {user && user.id === row.owner ?
            <DeleteButton
              success={this.delete}
              identificator = {row}
              title={`Delete '${row.title}'`}
              message={`Are you sure you want to delete  '${row.title} ?'`}  />:''}*/}



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

const WorkflowOwner = React.createClass({
  render: function(){
    const row = this.props.rowData;
    return <small>
            {row['owner_repr']}
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
      "columnName": "owner_repr",
      "order": 2,
      "locked": true,
      "visible": true,
      "displayName": "Creator",
      "customComponent": WorkflowOwner,
      "cssClassName": "owner-td"
      },
      {
      "columnName": "hash",
      "order": 3,
      "locked": true,
      "visible": true,
      "customComponent": WorkflowManage,
      "cssClassName": "manage-td",
      "displayName": " ",
      "user": this.props.user
      }
    ];
    return  <div className="panel panel-default panel-overflow griddle-pad">
              <div className="panel-heading">
                <i className="fa fa-sitemap pull-left"></i>
                <h3 className="text-center panel-title">Study Templates</h3>
                <Link style={{position: 'absolute', right: '10px', top: '7px', zIndex: 1002}} to="WorkflowEdit" params={{object: 'add', mode: 'edit'}} className="pull-right btn btn-xs btn-success"><i className="fa fa-plus"></i></Link>
              </div>
              <Griddle
                  noDataMessage={<center>You have not created any study templates yet, click on the plus icon above to create a new study template.</center>}
                  {...this.commonTableSettings()}
                  columns={["title", "owner_repr", "hash"]}
                  columnMetadata={columnMeta} />
            </div>;
  }

});

export default {WorkflowTable}
