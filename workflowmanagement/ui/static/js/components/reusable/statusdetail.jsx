'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import StatusDetailActions from '../../actions/StatusDetailActions.jsx';
import StatusDetailStore from '../../stores/StatusDetailStore.jsx';

import Griddle from 'griddle-react';

import {Loading, DeleteButton, ProcessLabel} from './component.jsx'
import {TableComponentMixin} from '../../mixins/component.jsx';

import moment from 'moment';

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

const ReassigningTask  = React.createClass({
  showReassignSelect(e){
    this.props.metadata.showReassign(e);
  },
  render: function(){
    const row = this.props.rowData;
    return !row.finished ? <a data-assignee={row.user} data-ptuhash={row.processtask.hash} data-pthash={row.processtask.task} data-cancel="true" onClick={this.showReassignSelect}>Reassigning  </a>
        : <span></span>;
  }
});

const TaskStatus = React.createClass({
  getStatus(row){
    if(row.finished)
        return 'Finished';

    //some combinations are never used
    switch(row.processtask.status){
      case 1: //Waitting fa fa-pause
        return 'Waitting';
      case 2: //Running fa fa-play
        return 'Running';
      case 3:
        return 'Finished';
      case 4:
        return 'Canceled';
      case 5:
        return 'Overdue';
      case 6:
        return 'Improving';
      case 7:
          switch(row.status){
            case 1: //Waitting fa fa-question
              return 'Waitting';
            case 2: //Accepted fa fa-check
              return 'Accepted';
            case 3: //Rejected fa fa-times
              return 'Rejected';
            case 4:
              return 'Running';
            case 5:
              return 'Finished';
            case 6:
              return 'Canceled';
            case 7:
              return 'Overdue';
            case 8:
              return 'Improving';
          }
    }

    return 'ERROR';
  },
  render: function(){
    const row = this.props.rowData;
    //<span><i className={`fa fa-2x ${this.getIcon(row)}`}></i></span>;
    return <span>{this.getStatus(row)}</span>;
  }
});


const StatusDetailTable = React.createClass({
    tableAction:StatusDetailActions.load,
    tableStore: StatusDetailStore,
    mixins: [Reflux.listenTo(StatusDetailStore, 'update'), TableComponentMixin],
    getInitialState: function() {
        return {
          phash: this.props.hash
        };
    },
    update: function(data){
        this.setState(this.getState());
    },
  showReassign(e){
    this.props.showReassign(e);
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
      "displayName": "Task"
      },
      {
      "columnName": "user_repr",
      "order": 3,
      "locked": false,
      "visible": true,
      "displayName": "User"
      },
      {
      "columnName": "status",
      "order": 4,
      "locked": false,
      "visible": true,
      "customComponent": TaskStatus,
      "displayName": "Status"
      },
      {
      "columnName": "reassigning",
      "order": 5,
      "locked": false,
      "visible": true,
      "customComponent": ReassigningTask,
      "showReassign": this.showReassign,
      "displayName": " "
      }
    ];
    return (
        <div>
          <Griddle
                      noDataMessage={<center>Something is wrong with this study! Please contact the administrator</center>}
                      {...this.commonTableSettings(false)}
                      columns={["type", "task_repr", "user_repr", "status","reassigning"]}
                      columnMetadata={columnMeta} />
        </div>
    )
  }

});

export default {StatusDetailTable}
