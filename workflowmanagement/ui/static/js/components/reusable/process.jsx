'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import ProcessActions from '../../actions/ProcessActions.jsx';
import ProcessStore from '../../stores/ProcessStore.jsx';

import Griddle from 'griddle-react';

import {Loading} from './component.jsx'
import {TableComponentMixin} from '../../mixins/component.jsx';

const ProcessManage = React.createClass({
  render: function(){
    const row = this.props.rowData;
    const object = {object: row.hash}

    return <div className="btn-group" role="group" aria-label="...">
            <Link className="btn btn-danger" to="Process" params={object}><i className="fa fa-times"></i></Link>
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

const ProcessStatus = React.createClass({
  render: function(){
    const row = this.props.rowData;
  function translateStatus(status){
    let extra = 'circle';
    switch(status){
      case 1:
        extra+=' circle-success'; break;
      case 2:
        extra+=' circle-danger'; break;
      case 3:
        extra+=' circle-grey'; break;
      case 3:
        extra+=' circle-warning'; break;
    }
    return <div className={extra}>&nbsp;</div>;

  }
    return <center>
            {translateStatus(row.status)}
           </center>;
  }
});

const ProcessLink = React.createClass({
  render: function(){
    const row = this.props.rowData;
    const object = {object: row.hash}
    return <small>
            <Link to="Process" params={object}>{row.object_repr}</Link>
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
    return  <div className="panel panel-default panel-overflow">
              <div className="panel-heading">
                <center><i className="fa fa-cogs pull-left"></i><h3 className="panel-title">My Processes</h3></center>
              </div>
              <Griddle
                  {...this.commonTableSettings()}
                  columns={["object_repr","start_date", 'progress', 'status', "hash"]}
                  columnMetadata={columnMeta} />
            </div>;
  }

});

export {ProcessTable}
