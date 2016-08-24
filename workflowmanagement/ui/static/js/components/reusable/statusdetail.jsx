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
    return <span><i className={`fa fa-2x ${this.getIcon(row.type)}`}></i></span>;
  }
});

const ReassigningTask  = React.createClass({
  showReassignSelect(user){
    console.log("");
  },
  render: function(){
    /** INCOMPLET **/
    const row = this.props.rowData;
    console.log("AAAQASAS");
    console.log(row);
    return <a data-assignee={row.user} data-cancel="true" onClick={this.showReassignSelect}>Reassigning  </a>;
  }
});

const TaskStatus = React.createClass({
  getIcon(row){
    switch(row.processtask.status){
      case 1: //Waitting
        return 'fa fa-pause';
      case 2: //Running
        return 'fa fa-play';
      case 7:
          switch(row.status){
            case 1: //Waitting
              return 'fa fa-question';
            case 2: //Accepted
              return 'fa fa-check';
            case 3: //Rejected
              return 'fa fa-times';
          }
    }

    return 'fa fa-exclamation-triangle';
  },
  render: function(){
    const row = this.props.rowData;
    return <span><i className={`fa fa-2x ${this.getIcon(row)}`}></i></span>;
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
      "displayName": " "
      }
    ];
    return (
        <div>
          <Griddle
                      noDataMessage={<center>Something is wrong with this study! Please contact the administrator</center>}
                      {...this.commonTableSettings()}
                      columns={["type", "task_repr", "user_repr", "status"]}
                      columnMetadata={columnMeta} />
        </div>
    )
  }

});

export default {StatusDetailTable}
