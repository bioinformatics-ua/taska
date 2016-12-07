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

const ProcessStatusDetail = React.createClass({
  render: function(){
    const row = this.props.rowData;
    const object = {object: row.hash}

      return(<small>
                <ProcessStatus rowData={this.props.rowData} />
                </small>);
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

const ProcessLinkDetail = React.createClass({
    render: function () {
        const row = this.props.rowData;
        const object = {object: row.hash}
        return <small>
                    <Link to="StatusDetail" params={object}>Show assignees</Link>
                </small>;
    }
});

const ProcessLinkRequests = React.createClass({
    render: function () {
        const row = this.props.rowData;
        const object = {object: row.hash}
        return <small>
                    <Link to="StudyRequests" params={object}>Show requests</Link>
                </small>;
    }
});

const ProcessLinkSendMessage = React.createClass({
    render: function () {
        const row = this.props.rowData;
        return <small>
                    <Link to="MessageSender" params={{hash: row.hash, object: 'process'}}>
                        <i className="fa fa-envelope"></i> Send message
                    </Link>
                </small>;
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
      "customComponent": ProcessStatusDetail,
      "cssClassName": "process-status-td",
      "displayName": "Status"
      },
      {
      "columnName": "link_status",
      "order": 5,
      "locked": true,
      "visible": true,
      "customComponent": ProcessLinkDetail,
      "displayName": "Assignees"
      },
      {
      "columnName": "link_requests",
      "order": 6,
      "locked": true,
      "visible": true,
      "customComponent": ProcessLinkRequests,
      "displayName": "Requests"
      },
      {
      "columnName": "link_send_message",
      "order": 7,
      "locked": true,
      "visible": true,
      "customComponent": ProcessLinkSendMessage,
      "displayName": " "
      },
      {
      "columnName": "hash",
      "order": 8,
      "locked": true,
      "visible": true,
      "customComponent": ProcessManage,
      "cssClassName": "process-td",
      "displayName": " "
      }
    ];

    return  <div className="panel panel-default panel-overflow  griddle-pad">
              <div className="panel-heading">
                <center><i className="fa fa-cogs pull-left"></i><h3 className="panel-title"> Studies that I lead </h3></center>
              </div>
              <Griddle
                  noDataMessage={<center>You have not ran any studies yet, to run a new study you must first create a protocol and then run it.</center>}
                  {...this.commonTableSettings(false)}
                  columns={["object_repr","start_date", 'progress', 'status', "link_status", "link_requests", "link_send_message", "hash"]}
                  columnMetadata={columnMeta} />
            </div>;
  }

});

export {ProcessTable}
