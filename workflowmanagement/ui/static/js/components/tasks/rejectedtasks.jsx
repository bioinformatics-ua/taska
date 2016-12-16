'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import RejectedTaskActions from '../../actions/RejectedTaskActions.jsx';
import RejectedTaskStore from '../../stores/RejectedTaskStore.jsx';

import Griddle from 'griddle-react';

import {Loading, DeleteButton} from '../reusable/component.jsx'
import {TableComponentMixin} from '../../mixins/component.jsx';
import {TaskType, TaskLink, TaskDate, TaskRequests} from './reusable/tablecomponents.jsx'

import moment from 'moment';

const RejectedTaskTable = React.createClass({
    tableAction: RejectedTaskActions.load,
    tableStore: RejectedTaskStore,
    mixins: [Reflux.listenTo(RejectedTaskStore, 'update'), TableComponentMixin],
    getInitialState: function () {
        return {};
    },
    update: function (data) {
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
                "cssClassName": 'task-repr-td',
                "displayName": "Title"
            },
            {
                "columnName": "process_repr",
                "order": 3,
                "locked": false,
                "visible": true,
                "cssClassName": 'process-repr-td',
                "displayName": "Study"
            },
            {
                "columnName": "deadline",
                "order": 4,
                "locked": true,
                "visible": true,
                "cssClassName": 'rejecteddeadline-td',
                "customComponent": TaskDate,
                "displayName": "Deadline"
            },
            {
                "columnName": "requests",
                "order": 5,
                "locked": true,
                "visible": true,
                "cssClassName": 'deadline-td',
                "customComponent": TaskRequests,
                "displayName": "Requests"
            }
        ];
        return <Griddle
            noDataMessage={<center>You currently have no rejected tasks yet. This tasks are all the tasks that you have
                rejected.</center>}
            {...this.commonTableSettings(true)}
            enableInfiniteScroll={true}
            useFixedHeader={true}
            columns={["type", "task_repr", "process_repr", "deadline", "requests"]}
            columnMetadata={columnMeta}/>
    }

});

export default {RejectedTaskTable}
