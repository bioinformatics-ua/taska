'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import MyFinishedStudiesActions from '../../actions/MyFinishedStudiesActions.jsx';
import MyFinishedStudiesStore from '../../stores/MyFinishedStudiesStore.jsx';

import Griddle from 'griddle-react';

import {ProcessStatus} from './component.jsx'
import {TableComponentMixin} from '../../mixins/component.jsx';

import {getTableSizeWithTabs} from '../../page_settings.jsx';

import Tabs from 'react-simpletabs';

import moment from 'moment';


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

const ProcessStatusDetail = React.createClass({
  render: function(){
    const row = this.props.rowData;
    const object = {object: row.hash}

      return(<small>
                <ProcessStatus rowData={this.props.rowData} />
                </small>);
  }
});

const ProcessLink = React.createClass({
  render: function(){
    const row = this.props.rowData;
    const object = {object: row.hash + '/showOnly'}
    return <small>
            <Link to="Process" params={object}>{row.title || row.object_repr}</Link>
           </small>;
  }
});

const MyFinishedStudiesTable = React.createClass({
    tableAction: MyFinishedStudiesActions.load,
    tableStore: MyFinishedStudiesStore,
    mixins: [Reflux.listenTo(MyFinishedStudiesStore, 'update'), TableComponentMixin],
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
      "cssClassName": "mystudies-process-title-td",
      "displayName": "Title"
      },
      {
      "columnName": "start_date",
      "order": 2,
      "locked": false,
      "visible": true,
      "cssClassName": "mystudies-start-date-td",
      "displayName": "Start Date"
      },
      {
      "columnName": "progress",
      "order": 3,
      "locked": true,
      "visible": true,
      "customComponent": ProcessProgress,
      "cssClassName": "mystudies-progress-td",
      "displayName": "Progress"
      },
      {
      "columnName": "status",
      "order": 4,
      "locked": true,
      "visible": true,
      "customComponent": ProcessStatusDetail,
      "cssClassName": "mystudies-status-td",
      "displayName": "Status"
      }
    ];
    
    return <Griddle
                              noDataMessage={<center>You currently have no studies assignee to you yet. This studies are all the studies that you are envolved.</center>}
                              {...this.commonTableSettings(true)}
                              enableInfiniteScroll={true}
                              useFixedHeader={true}
                              columns={["object_repr","start_date", 'progress', 'status']}
                              columnMetadata={columnMeta} />;

  }

});

export default {MyFinishedStudiesTable}