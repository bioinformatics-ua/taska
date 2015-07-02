'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import {Modal, PermissionsBar, Affix} from './reusable/component.jsx';

import TaskActions from '../actions/TaskActions.jsx';

import TaskStore from '../stores/TaskStore.jsx';

import moment from 'moment';

import Tabs from 'react-simpletabs';

import Griddle from 'griddle-react';

import ResultActions from '../actions/ResultActions.jsx';
import ResultStore from '../stores/ResultStore.jsx';

import UserStore from '../stores/UserStore.jsx';

import {TaskDependencies} from './TaskDependencies.jsx';

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

const RequestRequester = React.createClass({

    render(){
        var row = this.props.rowData;
        return <span>{row.processtaskuser['user_repr']}</span>;
    }
});

const StatusShow = React.createClass({
    render(){
        return  <span disabled className="form-control">
                    {moment(this.props.data['date']).fromNow()}
                </span>
    }
});

export default React.createClass({
    mixins: [   Router.Navigation,
                Authentication,
                Reflux.listenTo(TaskStore, 'update'), Reflux.listenTo(ResultStore, 'update')],
    statics: {
        fetch(params, route) {
            if(route.name.toLowerCase().indexOf('result') !== -1){
                return new Promise(function (fulfill, reject){

                ResultActions.loadDetailIfNecessary.triggerPromise(params.object).then(
                    (result) => {

                        return TaskActions.loadDetailIfNecessary.triggerPromise(result.processtaskuser).then(
                            (task) => {
                                fulfill({
                                    result: result,
                                    task: task
                                });
                            }
                        );

                    }
                ).catch(ex=> reject(ex));
                });
            } else{
                return TaskActions.loadDetailIfNecessary.triggerPromise(params.object).then(
                    (Task) => {
                        return Task;
                    }
                );
            }
        }
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    displayName: route => {
        try{
        let detail = Object.keys(route.props.detail)[0];
        if(route.props.detail[detail].result)
            return `Result - ${route.props.detail[detail].result.hash}`;
        else
            return `Task - ${route.props.detail[detail].task_repr}`;
        } catch(ex){
            return 'Task Not Found';
        }
    },
    __getState(result=false){
        let tmp = {
            answer: ResultStore.getAnswer(),
            submitted: ResultStore.answerSubmitted(),
            user: UserStore.getUser(),
            task: TaskStore.getDetail()
        };
        return tmp;
    },
    isMine(){
        if(this.state.user.id===this.state.answer['process_owner'])
            return true;

        return false;
    },
    didWrite(){
        if(!this.state.answer.hash)
            return true;

        if(this.state.user.id === this.state.answer.user)
            return true;

        return false;
    },
    getInitialState(){
        try {
            let detail = Object.keys(this.props.detail)[0];

            if(this.props.detail[detail].result)
                return this.__getState(true);

            return this.__getState();
        } catch(ex){
            return {}
        }
    },
    componentWillMount(){
        let r;
        try{
            let detail = Object.keys(this.props.detail)[0];
            r = this.props.detail[detail].result.hash;
        } catch(ex){
            r = undefined;
        }
        if(this.state.task.hash){
            delete this.state.task.hash;
        }

        ResultActions.calibrate(
            $.extend(this.state.task, {hash: r})
        );
    },
    componentWillUnmount(){
        ResultActions.unloadAnswer();
    },
    componentDidUpdate(){
        let detail = Object.keys(this.props.detail)[0];

        if(this.state.submitted && !this.props.detail[detail].result)
            this.context.router.transitionTo('home');
    },
    update(status){
        let detail = Object.keys(this.props.detail)[0];

        if(this.props.detail[detail].result)
            this.setState(this.__getState(true));
        else
            this.setState(this.__getState());
    },
    setAnswer(prop, val){
        ResultActions.setAnswer(prop, val);


    },
    saveAnswer(e){
        if(this.validate())
            ResultActions.saveAnswer();
    },
    render() {
        if(this.props.failed){
            let Failed = this.props.failed;
            return <Failed />;
        }

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
                },
                {
                  "columnName": "hash",
                  "order": 5,
                  "locked": false,
                  "visible": true,
                  "cssClassName": 'status-td',
                  "customComponent": RequestRequester,
                  "displayName": "Requester"
                }
            ];
        return (
            <div className="task-detail row">
                <div className="col-md-12">
                    <div className="panel panel-default">
                        <div className="panel-body">
                            <div className="row">
                                <div className={this.didWrite()? "col-md-9": "col-md-12"}>
                                      <div className="form-group">
                                        <div className="input-group">
                                          <span className="input-group-addon"><strong>Task</strong></span>
                                          <span disabled className="form-control">{this.state.task['task_repr']}</span>
                                        </div>
                                      </div>
                                      <div className="form-group">
                                        <div className="input-group">
                                          <span className="input-group-addon"><strong>Study</strong></span>
                                          <span disabled className="form-control">{this.state.task.processtask['process_repr']}</span>
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
                                <div className="col-md-3 reassignments">
                                    {this.didWrite()?
                                    (<div className="btn-group-vertical btn-block" role="group">
                                        <Link to="RequestAdd" params={{
                                            object: 'add',
                                            process: this.state.task.processtask.process,
                                            task: this.state.task.processtask.task,
                                            default: 1
                                        }} className="btn btn-default">
                                            <i style={{marginTop: '3px'}} className="pull-left fa fa-retweet" /> Ask for reassignment
                                        </Link>
                                        <Link to="RequestAdd" params={{
                                            object: 'add',
                                            process: this.state.task.processtask.process,
                                            task: this.state.task.processtask.task,
                                            default: 2
                                        }} className="btn btn-default">
                                            <i style={{marginTop: '3px'}} className="pull-left fa fa-question"></i> Ask for clarification
                                        </Link>
                                    </div>
                                    ):(
                                        <div></div>
                                    )
                                    }

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
                                {this.state.answer.hash?(
                                    <div className="col-md-12">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <div className="input-group">
                                                      <span className="input-group-addon"><strong>Executioner</strong></span>
                                                      <span disabled style={{float: 'none'}} className="form-control">
                                                        {this.state.answer['user_repr']}
                                                      </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <div className="input-group">
                                                      <span className="input-group-addon"><strong>Finish Date</strong></span>
                                                     <StatusShow data={this.state.answer} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ):''}
                            </div>
                            <div className="clearfix row">
                                <div className="col-md-12">
                                    <Tabs>
                                        <Tabs.Panel
                                        title={<span><i className="fa fa-tasks"></i> &nbsp;Answer</span>}>
                                            <div className="form-group row">
                                                <div className="col-md-9"></div>
                                                <div className="col-md-3">
                                                        {this.didWrite() ?
                                                        <Affix key={'savebar'} className={'savebar'} clamp={'.reassignments'} fill={false} offset={240}>
                                                            <button onClick={this.saveAnswer} className="btn btn-primary btn-block btn-default">
                                                                <i style={{marginTop: '3px'}} className="pull-left fa fa-floppy-o"></i> Save Answer
                                                            </button>
                                                        </Affix>
                                                        : ''}
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <DetailRender key={this.state.task.processtask.hash} />
                                                </div>
                                            </div>
                                        </Tabs.Panel>
                                        <Tabs.Panel title={<span><i className="fa fa-level-down"></i> &nbsp;Resource Inputs</span>}>
                                            <TaskDependencies context={this} />
                                        </Tabs.Panel>
                                        <Tabs.Panel title={<span><i className="fa fa-life-ring"></i> &nbsp;Related Requests</span>}>
                                            <Griddle
                                            {...table_style}
                                            results={this.state.task.requests}
                                                  columns={["title", "type", "resolved", "hash"]}
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

