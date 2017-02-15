'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import ProcessActions from '../../actions/ProcessActions.jsx';
import ProcessStore from '../../stores/ProcessStore.jsx';

import Griddle from 'griddle-react';

import {ProcessLink, ProcessProgress, ProcessStatusDetail, ProcessLinkDetail, ProcessLinkRequests, ProcessLinkSendMessage,  ProcessManage} from './reusable/components.jsx';

import {TableComponentMixin} from '../../mixins/component.jsx';

import {getTableSizeWithTabs} from '../../page_settings.jsx';

import Tabs from 'react-simpletabs';

import moment from 'moment';


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