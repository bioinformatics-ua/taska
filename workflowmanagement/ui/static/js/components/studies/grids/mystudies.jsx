'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import ProcessActions from '../../../actions/ProcessActions.jsx';
import ProcessStore from '../../../stores/ProcessStore.jsx';

import Griddle from 'griddle-react';

import {
    ProcessLink,
    ProcessProgress,
    ProcessStatusDetail,
    ProcessLinkDetail,
    ProcessLinkRequests,
    ProcessLinkSendMessage
} from '../reusable/components.jsx';

import {DeleteButton} from '../../reusable/component.jsx'

import {TableComponentMixin} from '../../../mixins/component.jsx';

import {getTableSizeWithTabs} from '../../../page_settings.jsx';

import Tabs from 'react-simpletabs';

import moment from 'moment';


const ProcessManage = React.createClass({
  delete(row){
    ProcessActions.deleteProcess(row.hash);
  },
  render: function(){
    const row = this.props.rowData;
    const object = {object: row.hash}

    return this.props.rowData.owner ? <div className="btn-group" role="group" aria-label="...">
           <DeleteButton
              success={this.delete}
              identificator = {row}
              title={`Delete '${row["title"] || row['object_repr']}'`}
              message={`Are you sure you want to delete  '${row["title"] || row['object_repr']} ?'`}  />
           </div>:<span></span>;
  }
});

const MyStudiesTable = React.createClass({
    tableAction: ProcessActions.load,
    tableStore: ProcessStore,
    mixins: [Reflux.listenTo(ProcessStore, 'update'), TableComponentMixin],
    getInitialState: function () {
        return {};
    },
    update: function (data) {
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
            },
            {
                "columnName": "link_status",
                "order": 5,
                "locked": true,
                "visible": true,
                "customComponent": ProcessLinkDetail,
                "cssClassName": "mystudies-link-status-td",
                "displayName": "Assignees"
            },
            {
                "columnName": "link_requests",
                "order": 6,
                "locked": true,
                "visible": true,
                "customComponent": ProcessLinkRequests,
                "cssClassName": "mystudies-link-requests-td",
                "displayName": "Requests"
            },
            {
                "columnName": "link_send_message",
                "order": 7,
                "locked": true,
                "visible": true,
                "customComponent": ProcessLinkSendMessage,
                "cssClassName": "mystudies-link-message-td",
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

        return <Griddle
            noDataMessage={<center>You have no current studies.</center>}
            {...this.commonTableSettings(true)}
            enableInfiniteScroll={true}
            useFixedHeader={true}
            columns={["object_repr", "start_date", 'progress', 'status', "link_status", "link_requests", "link_send_message", "hash"]}
            columnMetadata={columnMeta}/>;
    }

});

export default {MyStudiesTable}