'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import FutureTaskActions from '../../actions/FutureTaskActions.jsx';
import FutureTaskStore from '../../stores/FutureTaskStore.jsx';

import Griddle from 'griddle-react';

import {Loading, DeleteButton} from './component.jsx'
import {TableComponentMixin} from '../../mixins/component.jsx';


import moment from 'moment';

const TaskDateEst = React.createClass({

  renderMessage(deadline){
    const now = moment()
    const due = moment(deadline)

    if(due.isBefore(now))
      return <small className="pull-right text-danger">
    <span className="warnicon">Waiting dep. </span>
    <i title="You had accepted to complete this task, but the products you need to use for your task have not been completed yet. We are sorry for this. We are trying to solve this and will let you know as soon as you can start working on this task" className="task-overdue fa fa-2x fa-clock-o"></i>
    </small>;

    const diff = moment.duration(now.diff(due)).asDays();

    if(diff < 7)
      return <small className="pull-right task-warning"><span className="warnicon">{moment(deadline).fromNow()}</span> <i className="fa fa-2x fa-exclamation-triangle"></i></small>;

    return <small className="pull-right">{moment(deadline).fromNow()}</small>;
  },
  render(){
    const row = this.props.rowData;

    return this.renderMessage(row['start_date'])
  }
});

const TaskDate = React.createClass({

  renderMessage(deadline){
    const now = moment()
    const due = moment(deadline)

    if(due.isBefore(now))
      return <small className="pull-right text-danger">
    <span className="warnicon">Waiting dep. </span>
    <i title="You had accepted to complete this task, but the products you need to use for your task have not been completed yet. We are sorry for this. We are trying to solve this and will let you know as soon as you can start working on this task" className="task-overdue fa fa-2x fa-clock-o"></i>
    </small>;

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
    const row = this.props.rowData;
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
        return 'fa-cube';
      case 'form.FormTask':
        return 'fa-list-ul';
    }

    return 'fa-times-circle-o';
  },
  render: function(){
    const row = this.props.rowData.processtask;
    return <span><i className={`fa ${this.getIcon(row.type)}`}></i></span>;
  }
});



const FutureTaskTable = React.createClass({
    tableAction: FutureTaskActions.load,
    tableStore: FutureTaskStore,
    mixins: [Reflux.listenTo(FutureTaskStore, 'update'), TableComponentMixin],
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
      "columnName": "process_repr",
      "order": 3,
      "locked": false,
      "visible": true,
      "displayName": "Process"
      },
      {
      "columnName": "start_date",
      "order": 4,
      "locked": true,
      "visible": true,
      "cssClassName": 'start-td',
      "customComponent": TaskDateEst,
      "displayName": "Est. Start"
      },
      {
      "columnName": "deadline",
      "order": 5,
      "locked": true,
      "visible": true,
      "cssClassName": 'deadline-td',
      "customComponent": TaskDate,
      "displayName": "Deadline"
      }
    ];
    return <Griddle
                      noDataMessage={<center>You currently have no future tasks assigned to you at this moment. This tasks are assigned through the running of studies.</center>}
                      {...this.commonTableSettings(true)}
                      columns={["type", "task_repr", "process_repr", "start_date", "deadline"]}
                      columnMetadata={columnMeta} />
  }

});

export default {FutureTaskTable}
