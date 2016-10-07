'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import CompletedTaskActions from '../../actions/CompletedTaskActions.jsx';
import CompletedTaskStore from '../../stores/CompletedTaskStore.jsx';

import Griddle from 'griddle-react';

import {Loading, DeleteButton} from './component.jsx'
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



const CompletedTaskTable = React.createClass({
    tableAction: CompletedTaskActions.load,
    tableStore: CompletedTaskStore,
    mixins: [Reflux.listenTo(CompletedTaskStore, 'update'), TableComponentMixin],
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
      }
    ];
    return <Griddle
                      noDataMessage={<center>You currently have no completed tasks yet. This tasks are all the tasks that you have completed.</center>}
                      {...this.commonTableSettings()}
                      columns={["type", "task_repr", "process_repr"]}
                      columnMetadata={columnMeta} />
  }

});

export default {CompletedTaskTable}
