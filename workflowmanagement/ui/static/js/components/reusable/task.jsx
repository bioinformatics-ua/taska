'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import TaskActions from '../../actions/TaskActions.jsx';
import TaskStore from '../../stores/TaskStore.jsx';

import Griddle from 'griddle-react';

import {Loading, DeleteButton} from './component.jsx'
import {TableComponentMixin} from '../../mixins/component.jsx';

import moment from 'moment';

const TaskDate = React.createClass({

  renderMessage(deadline){
    const now = moment()
    const due = moment(deadline)

    if(due.isBefore(now))
      return <small className="pull-right text-danger"><span className="warnicon">{moment(deadline).fromNow()}</span> <i className="task-overdue fa fa-2x fa-exclamation-triangle animated infinite flash"></i></small>;

    const diff = moment.duration(now.diff(due)).asDays();

    if(diff < 7)
      return <small className="pull-right task-warning"><span className="warnicon">{moment(deadline).fromNow()}</span> <i className="fa fa-2x fa-exclamation-triangle"></i></small>;

    return <small className="pull-right">{moment(deadline).fromNow()}</small>;
  },
  render(){
    const row = this.props.rowData;

    return this.renderMessage(row.deadline)
  }
});

const TaskLink = React.createClass({
  render: function(){
    const row = this.props.rowData.processtask;
    const object = {object: row.hash}
    return <small title={row.process}>
            <Link id={`task_${row.hash}`}
              key={row.hash} to={this.props.rowData.type}
               params={object}>{this.props.rowData.task_repr}</Link><br />

           </small>;
  }
});

const TaskType = React.createClass({
  getIcon(type){
    switch(type){
      case 'tasks.SimpleTask':
        return 'fa-check';
      case 'form.FormTask':
        return 'fa-list-ul';
    }

    return 'fa-times-circle-o';
  },
  render: function(){
    const row = this.props.rowData.processtask;
    return <span><i className={`fa fa-2x ${this.getIcon(row.type)}`}></i></span>;
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
      "columnName": "type",
      "order": 1,
      "locked": false,
      "visible": true,
      "customComponent": TaskType,
      "displayName": "Type",
      "cssClassName": 'type-td',
      },
      {
      "columnName": "task_repr",
      "order": 2,
      "locked": false,
      "visible": true,
      "customComponent": TaskLink,
      "displayName": "Title"
      },
      {
      "columnName": "deadline",
      "order": 4,
      "locked": true,
      "visible": true,
      "cssClassName": 'deadline-td',
      "customComponent": TaskDate,
      "displayName": "Deadline"
      }
    ];
    return  <div className="panel panel-default panel-overflow  griddle-pad">
              <div className="panel-heading">
                <i className="fa fa-tasks pull-left"></i>
                <h3 style={{position: 'absolute', width: '95%'}} className="text-center panel-title">My Tasks</h3>
              </div>
              <Griddle
                  noDataMessage={<center>You currently have no tasks assigned to you at this moment. This tasks are assigned through the running of studies.</center>}
                  {...this.commonTableSettings()}
                  columns={["type", "task_repr", "deadline"]}
                  columnMetadata={columnMeta} />
            </div>;
  }

});

export default {TaskTable}
