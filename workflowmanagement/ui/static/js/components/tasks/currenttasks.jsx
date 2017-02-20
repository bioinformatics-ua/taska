'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import AllTaskActions from '../../actions/AllTaskActions.jsx';
import AllTaskStore from '../../stores/AllTaskStore.jsx';

import Griddle from 'griddle-react';

import {Loading, AcceptRejectButton, DeleteButton} from '../reusable/component.jsx'
import {TableComponentMixin} from '../../mixins/component.jsx';
import {TaskType, TaskLink, TaskDate, TaskDateEst, TaskRequests} from './reusable/tablecomponents.jsx'

import Tabs from 'react-simpletabs';

const TaskAvailability = React.createClass({
    accept(row){
        AllTaskActions.accept(row.hash);
    },
    reject(row){
        AllTaskActions.reject(this.props.rowData.hash, this.state.comment);
    },
    getInitialState: function () {
        return {
            comment: ""
        };
    },
    handleFieldChange: function (value) {
        this.setState({comment: value});
    },
    render: function () {
        const row = this.props.rowData;
        return ((row.processtask.status == 7 && row.status == 1) ?
            <div className="btn-group" role="group">
                <AcceptRejectButton
                    success={this.accept}
                    identificator={row}
                    label={"Accept"}
                    extraCss={"btn-xs btn-success"}/>
                <AcceptRejectButton
                    success={this.reject}
                    identificator={row}
                    label={"Reject"}
                    extraCss={"btn-xs btn-danger"}
                    title={`Reject '${row["task_repr"]}'`}
                    message={`Are you sure you want to reject the task '${row["task_repr"]}' ?'`}
                    onChange={this.handleFieldChange}
                    comment={this.state.comment}/>
            </div> : <span></span>);
    }
});

const CurrentTaskTable = React.createClass({
    tableAction: AllTaskActions.load,
    tableStore: AllTaskStore,
    mixins: [Reflux.listenTo(AllTaskStore, 'update'), TableComponentMixin],
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
                "cssClassName": 'task-repr-td',
                "customComponent": TaskLink,
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
                "columnName": "user_repr",
                "order": 4,
                "locked": true,
                "visible": true,
                "cssClassName": 'process-executioner-td',
                "displayName": "Manager"
            },
            {
                "columnName": "start_date",
                "order": 5,
                "locked": true,
                "visible": true,
                "cssClassName": 'start-date-td',
                "customComponent": TaskDateEst,
                "displayName": "Start"
            },
            {
                "columnName": "deadline",
                "order": 6,
                "locked": true,
                "visible": true,
                "cssClassName": 'deadline-td',
                "customComponent": TaskDate,
                "displayName": "Deadline"
            },
            {
                "columnName": "requests",
                "order": 7,
                "locked": true,
                "visible": true,
                "cssClassName": 'deadline-td',
                "customComponent": TaskRequests,
                "displayName": "Requests"
            },
            {
                "columnName": "availability",
                "order": 8,
                "locked": true,
                "visible": true,
                "cssClassName": 'availability-td',
                "customComponent": TaskAvailability,
                "displayName": ""
            }
        ];
        return <Griddle
            noDataMessage={<center>You have no assigned tasks.</center>}
            {...this.commonTableSettings(true)}
            enableInfiniteScroll={true}
            useFixedHeader={true}
            columns={["type", "task_repr", "process_repr", "start_date", "deadline", "requests", "availability"]}
            columnMetadata={columnMeta}/>;
    }

});

export default {CurrentTaskTable}
