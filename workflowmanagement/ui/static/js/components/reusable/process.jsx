'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import ProcessActions from '../../actions/ProcessActions.jsx';
import ProcessStore from '../../stores/ProcessStore.jsx';

import Griddle from 'griddle-react';

import {Loading, DeleteButton, PermissionsBar, ProcessStatus} from './component.jsx'
import {TableComponentMixin} from '../../mixins/component.jsx';

const ProcessManage = React.createClass({
  delete(row){
    ProcessActions.deleteProcess(row.hash);
  },
  render: function(){
    const row = this.props.rowData;
    const object = {object: row.hash}

    return <div className="btn-group" role="group" aria-label="...">
           <DeleteButton
              success={this.delete}
              identificator = {row}
              title={`Delete '${row["title"] || row['object_repr']}'`}
              message={`Are you sure you want to delete  '${row["title"] || row['object_repr']} ?'`}  />
           </div>;
  }
});

const ProcessProgress = React.createClass({
  render: function(){
    const row = this.props.rowData;
    return <center><div className="progress progressbar-process">
              <div className="progress-bar progress-bar-success progress-bar-striped" role="progressbar"
                aria-valuenow={row.progress} aria-valuemin="0"
                aria-valuemax="100" style={{width: `${row.progress}%`}}>
                <span className="sr-only">{row.progress}% Complete</span>
              </div>
            </div></center>;
  }
});

const ProcessLink = React.createClass({
  render: function(){
    const row = this.props.rowData;
    const object = {object: row.hash}
    return <small>
            <Link to="Process" params={object}>{row.title || row.object_repr}</Link>
           </small>;
  }
});

const ProcessTable = React.createClass({
    tableAction: ProcessActions.load,
    tableStore: ProcessStore,
    mixins: [Reflux.listenTo(ProcessStore, 'update'), TableComponentMixin],
    getInitialState: function() {
        return {};
    },
    update: function(data){
        this.setState(this.getState());
        console.log("set state process");
    },
  render: function () {
    const columnMeta = [
      {
      "columnName": "object_repr",
      "order": 1,
      "locked": false,
      "visible": true,
      "customComponent": ProcessLink,
      "displayName": "Title"
      },
      {
      "columnName": "start_date",
      "order": 2,
      "locked": false,
      "visible": true,
      "displayName": "Start Date"
      },
      {
      "columnName": "progress",
      "order": 3,
      "locked": true,
      "visible": true,
      "customComponent": ProcessProgress,
      "cssClassName": "process-td",
      "displayName": "Progress"
      },
      {
      "columnName": "status",
      "order": 4,
      "locked": true,
      "visible": true,
      "customComponent": ProcessStatus,
      "cssClassName": "process-td",
      "displayName": "Status"
      },
      {
      "columnName": "hash",
      "order": 5,
      "locked": true,
      "visible": true,
      "customComponent": ProcessManage,
      "cssClassName": "process-td",
      "displayName": " "
      }
    ];
    return  <div className="panel panel-default panel-overflow  griddle-pad">
              <div className="panel-heading">
                <center><i className="fa fa-cogs pull-left"></i><h3 className="panel-title">Studies</h3></center>
              </div>
              <Griddle
                  noDataMessage={<center>You have not ran any studies yet, to run a new study you must first create a protocol and then run it.</center>}
                  {...this.commonTableSettings()}
                  columns={["object_repr","start_date", 'progress', 'status', "hash"]}
                  columnMetadata={columnMeta} />
            </div>;
  }

});

export {ProcessTable}
