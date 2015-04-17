'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import {Modal, PermissionsBar} from './reusable/component.jsx';

import TaskActions from '../actions/TaskActions.jsx';

import TaskStore from '../stores/TaskStore.jsx';

import moment from 'moment';

import Tabs from 'react-simpletabs';

import Griddle from 'griddle-react';

const RequestTitle = React.createClass({
    render(){
        var row = this.props.rowData;

        return <span>
            <Link to="Request" params={{object: row.hash}}>
                {row.title}
            </Link>
        </span>;
    }
});

const RequestType = React.createClass({
    render(){
        var row = this.props.rowData;

        return <span>{row['type_repr']}</span>;
    }
});

const RequestStatus = React.createClass({

    render(){
        var row = this.props.rowData;
        if(row.resolved)
            return <span className="text-success"><i className="fa fa-check-circle"></i> Solved</span>;

        return <span><i className="fa fa-clock-o"></i> Waiting response</span>;
    }
});

export default React.createClass({
    mixins: [   Router.Navigation,
                Authentication,
                Reflux.listenTo(TaskStore, 'update')],
    statics: {
        fetch(params) {
            return TaskActions.loadDetailIfNecessary.triggerPromise(params.object).then(
                (Task) => {
                    return Task;
                }
            );
        }
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    displayName: route => {
        let detail = Object.keys(route.props.detail)[0];
        return `Task - ${route.props.detail[detail].task_repr}`;
    },
    __getState(){
        return {
            task: TaskStore.getDetail(),
            answer: TaskStore.getAnswer(),
            submitted: TaskStore.answerSubmitted()
        }
    },
    getInitialState(){
        return this.__getState();
    },
    componentWillMount(){
        TaskActions.calibrate();
    },
    componentWillUnmount(){
        TaskActions.unloadAnswer();
    },
    componentDidUpdate(){
        if(this.state.submitted)
            this.context.router.transitionTo('home');
    },
    update(status){
        if(status == TaskStore.DETAIL){
            this.setState(this.__getState());
        }
    },
    setAnswer(prop, val){
        TaskActions.setAnswer(prop, val);
    },
    saveAnswer(e){
        TaskActions.saveAnswer();
    },
    render() {
        console.log(this.state.task);

        let DetailRender = this.detailRender();
        let deadline = moment(this.state.task.deadline);

        let table_style = { bodyHeight:375,
            tableClassName: "table table-bordered table-striped",
            useGriddleStyles: false,
            nextClassName: "table-prev",
            previousClassName: "table-next",
            sortAscendingComponent: <i className="pull-right fa fa-sort-asc"></i>,
            sortDescendingComponent: <i className="pull-right fa fa-sort-desc"></i>};
        let table_meta =[
                {
                  "columnName": "title",
                  "order": 1,
                  "locked": false,
                  "visible": true,
                  "customComponent": RequestTitle,
                  "displayName": "Title"
                },
                {
                  "columnName": "type",
                  "order": 2,
                  "locked": false,
                  "visible": true,
                  "customComponent": RequestType,
                  "displayName": "Type",
                  "cssClassName": 'status-td'
                },
                {
                  "columnName": "resolved",
                  "order": 4,
                  "locked": false,
                  "visible": true,
                  "cssClassName": 'status-td',
                  "customComponent": RequestStatus,
                  "displayName": "Status"
                }
            ];

        return (
            <div className="task-detail row">
                <div className="col-md-12">
                    <div className="panel panel-default">
                        <div className="panel-body">
                            <div className="row">
                                <div className="col-md-9">
                                      <div className="form-group">
                                        <div className="input-group">
                                          <span className="input-group-addon"><strong>Task</strong></span>
                                          <span disabled className="form-control">{this.state.task['task_repr']}</span>
                                        </div>
                                      </div>
                                      <div className="row">
                                        <div className="col-md-6">
                                          <div className="form-group">
                                            <div className="input-group">
                                              <span className="input-group-addon"><strong>Type</strong></span>
                                              <span disabled className="form-control">{this.getTypeRepr()}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <div className="input-group">
                                                  <span className="input-group-addon"><strong>Deadline</strong></span>
                                                  <span disabled className="form-control">
                                                    {deadline.fromNow()}&nbsp;
                                                    <small>({deadline.format('YYYY-MM-DD HH:mm')})</small>
                                                  </span>
                                                </div>
                                            </div>
                                        </div>
                                      </div>

                                </div>
                                <div className="col-md-3">
                                    <div className="btn-group-vertical btn-block" role="group">
                                        <Link to="RequestAdd" params={{
                                            object: 'add',
                                            process: this.state.task.processtask.process,
                                            task: this.state.task.processtask.task,
                                            default: 1
                                        }} className="btn btn-default">
                                            <i style={{marginTop: '3px'}} className="pull-left fa fa-retweet"></i> Ask for reassignment
                                        </Link>
                                        <Link to="RequestAdd" params={{
                                            object: 'add',
                                            process: this.state.task.processtask.process,
                                            task: this.state.task.processtask.task,
                                            default: 1
                                        }} className="btn btn-default">
                                            <i style={{marginTop: '3px'}} className="pull-left fa fa-question"></i> Ask for clarification
                                        </Link>
                                    </div>
                                </div>
                                     <div className="col-md-12">
                                            <div className="form-group">
                                                <div className="input-group">
                                                  <span className="input-group-addon"><strong>Description</strong></span>
                                                  <span disabled style={{float: 'none'}} className="form-control">
                                                    {this.state.task.processtask.parent.description}
                                                  </span>
                                                </div>
                                            </div>
                                        </div>
                            </div>
                            <div className="clearfix row">
                                <div className="col-md-12">
                                    <Tabs>
                                        <Tabs.Panel
                                        title={<span><i className="fa fa-tasks"></i> &nbsp;Resolve Task</span>}>
                                            <div className="form-group row">
                                                <div className="col-md-9"></div>
                                                <div className="col-md-3">
                                                        <button onClick={this.saveAnswer} className="btn btn-primary btn-block btn-default">
                                                            <i style={{marginTop: '3px'}} className="pull-left fa fa-floppy-o"></i> Mark as complete
                                                        </button>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <DetailRender key={this.state.task.processtask.hash} />
                                                </div>
                                            </div>
                                        </Tabs.Panel>
                                            <Tabs.Panel title={<span><i className="fa fa-life-ring"></i> &nbsp;My Requests</span>}>
                                                <Griddle
                                                {...table_style}
                                                results={this.state.task.requests}
                                                      columns={["title", "type", "resolved"]}
                                                columnMetadata={table_meta}
                                                />
                                            </Tabs.Panel>
                                    </Tabs>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

