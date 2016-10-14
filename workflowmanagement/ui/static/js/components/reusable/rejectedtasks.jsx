'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import RejectedTaskActions from '../../actions/RejectedTaskActions.jsx';
import RejectedTaskStore from '../../stores/RejectedTaskStore.jsx';

import Griddle from 'griddle-react';

import {Loading, DeleteButton} from './component.jsx'
import {TableComponentMixin} from '../../mixins/component.jsx';

import moment from 'moment';

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



const RejectedTaskTable = React.createClass({
    tableAction: RejectedTaskActions.load,
    tableStore: RejectedTaskStore,
    mixins: [Reflux.listenTo(RejectedTaskStore, 'update'), TableComponentMixin],
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
      "displayName": "Studie"
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
                      noDataMessage={<center>You currently have no rejected tasks yet. This tasks are all the tasks that you have rejected.</center>}
                      {...this.commonTableSettings()}
                      enableInfiniteScroll={true}
                      useFixedHeader={true}
                      columns={["type", "task_repr", "process_repr", "deadline"]}
                      columnMetadata={columnMeta} />
  }

});

export default {RejectedTaskTable}
