'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link, browserHistory} from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import {Modal, PermissionsBar, AcceptRejectButton, Affix} from './reusable/component.jsx';

import StateActions from '../actions/StateActions.jsx';

import TaskActions from '../actions/TaskActions.jsx';
import AllTaskActions from '../actions/AllTaskActions.jsx';

import TaskStore from '../stores/TaskStore.jsx';

import moment from 'moment';

import Tabs from 'react-simpletabs';

import Griddle from 'griddle-react';

import ResultActions from '../actions/ResultActions.jsx';
import ResultStore from '../stores/ResultStore.jsx';

import UserStore from '../stores/UserStore.jsx';

import {TaskDependencies} from './TaskDependencies.jsx';

import {depmap} from '../map.jsx';

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
            saved: ResultStore.answerSaved(),
            user: UserStore.getUser(),
            task: TaskStore.getDetail(),
            dversion: TaskStore.getDepVersion(),
            comment: ""
        };
        return tmp;
    },
    isMine(){
        if(this.state.user.id===this.state.answer['process_owner'])
            return true;

        return false;
    },
    didWrite(){
        if(!this.state.answer.hash) {
            return true;
        }

        if(this.state.user.id === this.state.answer.user)
            return true;

        return false;
    },
    waitingTask(){
        if(this.state.task.processtask.status == 7)//Waiting availability
            return false;
        return this.didWrite();
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
        if(this.state.saved && !this.props.detail[detail].result){
            this.context.router.transitionTo(this.state.saved.type, {object: this.state.saved.hash});
        }
        if(this.state.submitted){
            this.context.router.transitionTo('home');
        }
    },
    update(status, force=false){
        let detail = Object.keys(this.props.detail)[0];

        if(this.props.detail[detail].result)
            this.setState(this.__getState(true));
        else
            this.setState(this.__getState());

        if(force){
            location.reload();
        }
    },
    setAnswer(prop, val){
        ResultActions.setAnswer(prop, val);
    },
    submitAnswer(e){
        console.log("Clicked");
        if(this.validate())
            ResultActions.submitAnswer();
    },
    saveAnswer(e){
        console.log("Saved");
        console.log(this.validate());
        if(this.validate())
            ResultActions.saveAnswer();
    },
    showWorkflow(){
        console.log("show");
    },
    __createMap(own, deps){
        let linkmap = {};

        for(let link of own){
            linkmap[link.filename] = link.path;
        }

        for(let dep of deps){
            if(dep.users){
                for(let user of dep.users){

                    if(user.result){
                        let user_outputs = user.result.outputs;
                        if(user_outputs){
                            for(let output of user_outputs){
                                linkmap[output.filename] = output.path;
                            }
                        }
                    }
                }
            }
        }

        return linkmap;

    },
    digestDescription(desc, map){
                if(desc){

                    let result = desc.replace(/#\((.*?)\)/g, function(a, b){
                        let hit = map[b];

                        if(hit)
                            return '<a target="_blank" href="'+map[b]+'">' + b + '</a>';
                        else
                            return b;

                    });

                    result = result.replace(/((http[s]?:\/\/[\w.\/_\-=?]+)|(mailto:[\w.\/@_\-=?]+))/g, function(a, b){
                        return '<a target="_blank" href="'+b+'">' + b + '</a>';

                    });

                    return result;
                }
                return undefined;
    },
    preliminary(){
        let hash = this.context.router.getCurrentParams().object;

        TaskActions.preliminary(hash);
    },
    accept(){
      let hash = this.context.router.getCurrentParams().object;
      TaskActions.accept(hash);
    },
    reject(){
      let hash = this.context.router.getCurrentParams().object;
      TaskActions.reject(hash, this.state.comment);
    },
    handleFieldChange: function(value) {
        this.setState({comment: value});
    },
    render() {
        if(this.props.failed){
            let Failed = this.props.failed;
            return <Failed />;
        }

        let depmap = this.__createMap(this.state.task.processtask.parent.resources, this.state.task.dependencies);
        let description = this.digestDescription(this.state.task.processtask.parent.description ,depmap) || '';
        let getDesc = () => { return {__html: description} };

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

        let detail;

        try{
            detail = Object.keys(this.props.detail)[0];
        } catch(err){
        };

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
                                    (<div className="btn-group-vertical  btn-block" role="group">
                                           <span> {this.state.task.status == 1 && this.state.task.processtask.status == 7 ?
                                                <div className="btn-group btn-block" role="group2" >
                                                    <AcceptRejectButton
                                                      success={this.accept}
                                                      identificator = {this.state.task}
                                                      label={"Accept"}
                                                      extraCss={"btn-success "}
                                                      extraStyle={{width:'50%'}} />
                                                    <AcceptRejectButton
                                                      success={this.reject}
                                                      identificator = {this.state.task}
                                                      label={"Reject"}
                                                      extraCss={"btn-danger "}
                                                      extraStyle={{width:'50%'}}
                                                      title={`Reject '${this.state.task["task_repr"]}'`}
                                                      message={`Are you sure you want to reject the task '${this.state.task["task_repr"]}' ?'`}
                                                      onChange={this.handleFieldChange}
                                                      comment={this.state.comment} />
                                                    </div> :''}</span>
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
                                 <div className="col-md-9">
                                        <div className="form-group">
                                            <div className="input-group">
                                              <span className="input-group-addon"><strong>Description</strong></span>
                                              <span disabled style={{float: 'none'}} className="form-control">
                                              <span style={{wordBreak: 'break-word'}} dangerouslySetInnerHTML={getDesc()} />
                                              </span>
                                            </div>
                                        </div>
                                </div>
                                <div className="col-md-3">
                                        <div className="form-group">
                                            <div className="input-group">
                                              <span className="input-group-addon"><strong>Required Effort</strong></span>
                                              <span disabled style={{float: 'none'}} className="form-control">
                                                {this.state.task.processtask.parent.effort} hours
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
                                    {this.state.task.processtask.status > 1?

<div>
  <ul className="nav nav-tabs" role="tablist">
    <li role="presentation" className="active"><a href="#answer" aria-controls="answer" role="tab" data-toggle="tab"><i className="fa fa-tasks"></i> &nbsp;Answer</a></li>
    <li role="presentation"><a href="#resources" aria-controls="resources" role="tab" data-toggle="tab"><i className="fa fa-level-down"></i> &nbsp;Resource Inputs</a></li>
    <li role="presentation"><a href="#requests" aria-controls="requests" role="tab" data-toggle="tab"><i className="fa fa-life-ring"></i> &nbsp;Related Requests</a></li>
  </ul>
  <div className="tab-content">
    <div role="tabpanel" className="tab-pane active" id="answer">
        <div className="form-group row">
            <div className="col-md-8"></div>
                <div className="col-md-4">


                    <Link to="Process" params={{object: this.state.task.processtask.process  + '/showOnly'}}>
                        <button style={{marginLeft: '4px'}} onClick={this.showWorkflow} className="btn btn-info pull-right">
                            <i style={{marginTop: '3px'}} className="pull-left fa fa-sitemap"></i> Workflow
                        </button>
                    </Link>
                    {this.waitingTask() ?
                        <Affix key={'task_savebar'} className={'savebar'} clamp={'.reassignments'} fill={false} offset={240}>
                                <button style={{marginLeft: '4px'}} onClick={this.saveAnswer} className="btn btn-primary pull-right">
                                    <i style={{marginTop: '3px'}} className="pull-left fa fa-floppy-o"></i> Save
                                </button>

                                { detail && this.props.detail && this.props.detail[detail].result?
                                    <button onClick={this.submitAnswer} className="btn btn-success pull-right">
                                    <i style={{marginTop: '3px'}} className="pull-left fa fa-floppy-o"></i> Submit
                                </button>:''}

                            </Affix>
                            : ''}
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                       {this.waitingTask() ? <DetailRender key={this.state.task.processtask.hash} /> :''}
                </div>
        </div>
    </div>
    <div role="tabpanel" className="tab-pane" id="resources"><TaskDependencies context={this} /></div>
    <div role="tabpanel" className="tab-pane" id="requests">
                                            <Griddle
                                            {...table_style}
                                            results={this.state.task.requests}
                                                  columns={["title", "type", "resolved", "hash"]}
                                            columnMetadata={table_meta}
                                            />
    </div>
  </div>

</div>
                                    :
                                    <div>
                                        <center><h4>
                                        This task is scheduled to be executed by you, but is waiting that other intervenients finish their own tasks, which your task depends upon.
                                        </h4><hr /><h2>Preliminary Inputs</h2></center>

                                        <button onClick={this.preliminary} className="pull-right btn btn-info"><i className="fa fa-refresh"></i> Update Preliminary Inputs</button>
                                        <TaskDependencies dversion={this.state.dversion} context={this} />
                                    </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

