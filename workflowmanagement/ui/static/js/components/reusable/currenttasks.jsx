'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import AllTaskActions from '../../actions/AllTaskActions.jsx';
import AllTaskStore from '../../stores/AllTaskStore.jsx';

import Griddle from 'griddle-react';

import {Loading, AcceptRejectButton, DeleteButton} from './component.jsx'
import {TableComponentMixin} from '../../mixins/component.jsx';

import moment from 'moment';

import Tabs from 'react-simpletabs';

 import {depmap} from '../../map.jsx';

const TaskDateEst = React.createClass({

  renderMessage(deadline){
    const now = moment()
    const due = moment(deadline)

    return <small className="pull-left">{moment(deadline).fromNow()}</small>;
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
      return <small className="pull-left text-danger"><span className="warnicon">{moment(deadline).fromNow()}<i className="task-overdue fa fa-exclamation-triangle animated infinite flash"></i></span> </small>;

    return <small className="pull-left">{moment(deadline).fromNow()}</small>;
  },
  render(){
    const row = this.props.rowData;

    return this.renderMessage(row.deadline)
  }
});

const TaskLink = React.createClass({
  render: function(){
    const row = this.props.rowData;
    let object = {object: (row.result? row.result:row.hash)}

    return <small title={row.process}>
            {!row.result ?
            <Link id={`task_${row.hash}`}
              key={row.hash} to={this.props.rowData.type}
               params={object}>{this.props.rowData.task_repr}</Link>
            :<span><Link id={`task_${row.hash}`}
              key={row.result} to={depmap[this.props.rowData.type]}
               params={object}>{this.props.rowData.task_repr}</Link> <span className="label label-warning">Incomplete</span>
</span>}
            <br />
           </small>;
  }
});

const TaskType = React.createClass({
  getIcon(row){
    if(row.processtask.status == 1 || (row.processtask.status == 7 && row.status == 2))
        return 'glyphicon glyphicon-hourglass';//I dont know way fa-hourglass dont work, so i used this

    switch(row.processtask.type){
      case 'tasks.SimpleTask':
        return 'fa-cube';
      case 'form.FormTask':
        return 'fa-list-ul';
    }

    return 'fa-times-circle-o';
  },
  render: function(){
    const row = this.props.rowData;
    return <span><i className={`fa ${this.getIcon(row)}`}></i></span>;
  }
});

const TaskAvailability = React.createClass({
  accept(row){
    AllTaskActions.accept(row.hash);
  },
  reject(row){
    AllTaskActions.reject(this.props.rowData.hash, this.state.comment);
  },
  getInitialState: function() {
    return {
      comment: ""
    };
  },
  handleFieldChange: function(value) {
    this.setState({comment: value});
  },
  render: function(){
    const row = this.props.rowData;
    return ((row.processtask.status == 7 && row.status == 1) ?
          <div className="btn-group" role="group" >
            <AcceptRejectButton
              success={this.accept}
              identificator = {row}
              label={"Accept"}
              extraCss={"btn-xs btn-success"} />
            <AcceptRejectButton
              success={this.reject}
              identificator = {row}
              label={"Reject"}
              extraCss={"btn-xs btn-danger"} 
              title={`Reject '${row["task_repr"]}'`}
              message={`Are you sure you want to reject the task '${row["task_repr"]}' ?'`}
              onChange={this.handleFieldChange}
              comment={this.state.comment} />
            </div>:<span></span>);
  }
});


const CurrentTaskTable = React.createClass({
    tableAction: AllTaskActions.load,
    tableStore: AllTaskStore,
    mixins: [Reflux.listenTo(AllTaskStore, 'update'), TableComponentMixin],
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
      "cssClassName": 'task-repr-td',
      "customComponent": TaskLink,
      "displayName": "Title"
      },
      {
      "columnName": "process_repr",
      "order": 3,
      "locked": false,
      "visible": true,
      "cssClassName": 'process-repr-td',
      "displayName": "Studie"
      },
      {
      "columnName": "user_repr",
      "order": 4,
      "locked": true,
      "visible": true,
      "cssClassName": 'process-executioner-td',
      "displayName": "Manager"
      },
      {
      "columnName": "start_date",
      "order": 5,
      "locked": true,
      "visible": true,
      "cssClassName": 'start-date-td',
      "customComponent": TaskDateEst,
      "displayName": "Start"
      },
      {
      "columnName": "deadline",
      "order": 6,
      "locked": true,
      "visible": true,
      "cssClassName": 'deadline-td',
      "customComponent": TaskDate,
      "displayName": "Deadline"
      },
      {
      "columnName": "availability",
      "order": 7,
      "locked": true,
      "visible": true,
      "cssClassName": 'availability-td',
      "customComponent": TaskAvailability,
      "displayName": "Availability"
      }
    ];
    return <Griddle
                      noDataMessage={<center>You currently have no current tasks assigned to you at this moment. This tasks are assigned through the running of studies.</center>}
                      {...this.commonTableSettings(true)}
                      enableInfiniteScroll={true}
                      useFixedHeader={true}
                      columns={["type", "task_repr", "process_repr", "start_date", "deadline", "availability"]}
                      columnMetadata={columnMeta} />;
  }

});

export default {CurrentTaskTable}
