'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import TaskActions from '../../actions/TaskActions.jsx';
import TaskStore from '../../stores/TaskStore.jsx';

import Griddle from 'griddle-react';

import {Loading, DeleteButton} from './component.jsx'
import {TableComponentMixin} from '../../mixins/component.jsx';

const TaskManage = React.createClass({
  delete(row){
    TaskActions.deleteTask(row.hash);
  },
  render: function(){
    const row = this.props.rowData;
    const object = {object: row.task, mode: 'edit'};
    const object2 = {object: row.task, mode: 'run'};
    return <div className="btn-group" role="group" aria-label="...">
              ÇAÇA
           </div>;
  }
});

const TaskLink = React.createClass({
  render: function(){
    const row = this.props.rowData;
    const object = {object: row.task}
    return <small>
            <Link to="Task" params={object}>{row.task_repr}</Link>
           </small>;
  }
});


const TaskTable = React.createClass({
    tableAction: TaskActions.load,
    tableStore: TaskStore,
    mixins: [Reflux.listenTo(TaskStore, 'update'), TableComponentMixin],
    getInitialState: function() {
        return {};
    },
    update: function(data){
        this.setState(this.getState());
    },
  render: function () {
    const columnMeta = [
      {
      "columnName": "task_repr",
      "order": 1,
      "locked": false,
      "visible": true,
      "customComponent": TaskLink,
      "displayName": "Title"
      },
      {
      "columnName": "task",
      "order": 2,
      "locked": true,
      "visible": true,
      "customComponent": TaskManage,
      "cssClassName": "manage-td",
      "displayName": " "
      }
    ];
    return  <div className="panel panel-default panel-overflow">
              <div className="panel-heading">
                <i className="fa fa-cogs pull-left"></i>
                <h3 style={{position: 'absolute', width: '95%'}} className="text-center panel-title">My Tasks</h3>
              </div>
              <Griddle
                  {...this.commonTableSettings()}
                  columns={["task_repr", "deadline", "task"]}
                  columnMetadata={columnMeta} />
            </div>;
  }

});

export default {TaskTable}
