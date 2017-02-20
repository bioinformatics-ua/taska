'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import {depmap} from '../../../map.jsx';

import moment from 'moment';

const TaskType = React.createClass({
    getIcon(row){
        if (row.processtask.status == 1 || (row.processtask.status == 7 && row.status == 2) || (row.processtask.status == 2 && row.status == 1))
            return 'glyphicon glyphicon-hourglass';//I dont know way fa-hourglass dont work, so i used this

        switch (row.processtask.type) {
            case 'tasks.SimpleTask':
                return 'fa-cube';
            case 'form.FormTask':
                return 'fa-list-ul';
        }

        return 'fa-times-circle-o';
    },
    render: function () {
        const row = this.props.rowData;

        return <span><i className={`fa ${this.getIcon(row)}`}></i></span>;
    }
});

const TaskLink = React.createClass({
    render: function () {
        const row = this.props.rowData;
        let object = {object: (row.result ? row.result : row.hash)};

        return <small title={row.process}>
            {!row.result || row.finished ?
                <Link id={`task_${row.hash}`}
                      key={row.hash} to={this.props.rowData.type}
                      params={object}>{this.props.rowData.task_repr}</Link>
                : <span><Link id={`task_${row.hash}`}
                              key={row.result} to={depmap[this.props.rowData.type]}
                              params={object}>{this.props.rowData.task_repr}</Link> <span
                className="label label-warning">Incomplete</span>
                  </span>}
            <br />
        </small>;
    }
});

const TaskDate = React.createClass({

    renderMessage(deadline){
        const now = moment();
        const due = moment(deadline);

        if (due.isBefore(now))
            return <small className="pull-left text-danger"><span className="warnicon">{moment(deadline).fromNow()}<i
                className="task-overdue fa fa-exclamation-triangle animated infinite flash"></i></span></small>;

        return <small className="pull-left">{moment(deadline).fromNow()}</small>;
    },
    render(){
        const row = this.props.rowData;

        return this.renderMessage(row.deadline)
    }
});

const TaskDateEst = React.createClass({

    renderMessage(deadline){
        const now = moment();
        const due = moment(deadline);

        return <small className="pull-left">{moment(deadline).fromNow()}</small>;
    },
    render(){
        const row = this.props.rowData;

        return this.renderMessage(row['start_date']);
    }
});

const TaskRequests = React.createClass({
    render: function () {
        const requests = this.props.rowData.requests;

        let clarificationRequest, reassignmentRequest;
        if (requests.length > 0)
            for (var i = 0; i < requests.length; i++) {
                if (requests[i].type == 1 && requests[i].response != null)
                    clarificationRequest = <i className={`fa fa-retweet`}></i>;

                if (requests[i].type == 2 && requests[i].response != null)
                    reassignmentRequest = <i className={`fa fa-question`}></i>;
            }
        return <span><small> {clarificationRequest} {reassignmentRequest} </small></span>;
    }
});

const TaskStatus = React.createClass({
    getStatus(row){
        if (row.finished)
            return 'Finished';

        //some combinations are never used
        switch (row.processtask.status) {
            case 1: //Waiting fa fa-pause
                return 'Waiting';
            case 2: //Running fa fa-play
                return 'Running';
            case 3:
                return 'Finished';
            case 4:
                return 'Canceled';
            case 5:
                return 'Overdue';
            case 6:
                return 'Improving';
            case 7:
                switch (row.status) {
                    case 1: //Waiting fa fa-question
                        return 'Waiting';
                    case 2: //Accepted fa fa-check
                        return 'Accepted';
                    case 3: //Rejected fa fa-times
                        return 'Rejected';
                    case 4:
                        return 'Running';
                    case 5:
                        return 'Finished';
                    case 6:
                        return 'Canceled';
                    case 7:
                        return 'Overdue';
                    case 8:
                        return 'Improving';
                }
        }

        return 'ERROR';
    },
    render: function () {
        const row = this.props.rowData;

        return <span>{this.getStatus(row)}</span>;
    }
});


export {TaskType, TaskLink, TaskDate, TaskDateEst, TaskRequests, TaskStatus}