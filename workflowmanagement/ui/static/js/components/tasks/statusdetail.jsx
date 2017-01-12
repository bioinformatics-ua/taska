'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import StatusDetailActions from '../../actions/StatusDetailActions.jsx';
import StatusDetailStore from '../../stores/StatusDetailStore.jsx';

import Griddle from 'griddle-react';

import {Loading, DeleteButton, ProcessLabel} from '../reusable/component.jsx'
import {TableComponentMixin} from '../../mixins/component.jsx';

import moment from 'moment';
import {TaskType, TaskStatus} from './reusable/tablecomponents.jsx'

const ReassigningTask = React.createClass({
    showReassignSelect(e){
        this.props.metadata.showReassign(e);
    },
    render: function () {
        const row = this.props.rowData;
        return !row.finished ?
            <a data-assignee={row.user} data-ptuhash={row.processtask.hash} data-pthash={row.processtask.task}
               data-cancel="true" onClick={this.showReassignSelect}>Reassigning </a>
            : <span></span>;
    }
});

const StatusDetailTable = React.createClass({
    tableAction: StatusDetailActions.load,
    tableStore: StatusDetailStore,
    mixins: [Reflux.listenTo(StatusDetailStore, 'update'), TableComponentMixin],
    getInitialState: function () {
        return {
            phash: this.props.hash
        };
    },
    update: function (data) {
        this.setState(this.getState());
    },
    showReassign(e){
        this.props.showReassign(e);
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
                "displayName": "Task"
            },
            {
                "columnName": "user_repr",
                "order": 3,
                "locked": false,
                "visible": true,
                "displayName": "User"
            },
            {
                "columnName": "status",
                "order": 4,
                "locked": false,
                "visible": true,
                "customComponent": TaskStatus,
                "displayName": "Status"
            },
            {
                "columnName": "reassigning",
                "order": 5,
                "locked": false,
                "visible": true,
                "customComponent": ReassigningTask,
                "showReassign": this.showReassign,
                "displayName": " "
            }
        ];
        return (
            <div>
                <Griddle
                    noDataMessage={<center>Something is wrong with this study! Please contact the
                        administrator</center>}
                    {...this.commonTableSettings(false)}
                    columns={["type", "task_repr", "user_repr", "status", "reassigning"]}
                    columnMetadata={columnMeta}/>
            </div>
        )
    }

});

export default {StatusDetailTable}
