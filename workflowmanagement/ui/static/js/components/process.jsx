'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import {Modal, PermissionsBar, ProcessStatus} from './reusable/component.jsx';

import WorkflowActions from '../actions/WorkflowActions.jsx';

import ProcessActions from '../actions/ProcessActions.jsx';

import WorkflowStore from '../stores/WorkflowStore.jsx';

import ProcessStore from '../stores/ProcessStore.jsx';

import {StateMachineComponent} from '../react-statemachine/component.jsx';

import {StateMachine, SimpleState} from '../react-statemachine/classes.jsx';

import {SimpleTask, SimpleTaskRun} from './reusable/states/SimpleTask.jsx';

const ProcessLabel = React.createClass({
    render(){
        return <table className="process-label">
                    <tr>
                        <td><div className="circle circle-sm circle-default"></div></td>
                        <td><small>&nbsp;Waiting&nbsp;&nbsp;</small></td>
                        <td><div className="circle circle-sm circle-primary"></div></td>
                        <td><small>&nbsp;Running&nbsp;&nbsp;</small></td>
                        <td><div className="circle circle-sm circle-success"></div></td>
                        <td><small>&nbsp;Finished&nbsp;&nbsp;</small></td>
                        <td><div className="circle circle-sm circle-warning"></div></td>
                        <td><small>&nbsp;Overdue&nbsp;&nbsp;</small></td>
                        <td><div className="circle circle-sm"></div></td>
                        <td><small>&nbsp;Canceled&nbsp;&nbsp;</small></td>
                    </tr>
                </table>
    }
})

export default React.createClass({
    mixins: [   Router.Navigation,
                Authentication,
                Reflux.listenTo(ProcessStore, 'update')],
    statics: {
        fetch(params) {
                return new Promise(function (fulfill, reject){

                    ProcessActions.loadDetailIfNecessary.triggerPromise(params.object).then(
                        (Process) => {
                            WorkflowActions.loadDetailIfNecessary.triggerPromise(Process.workflow).then(
                                (Workflow) => {
                                    fulfill({
                                        process: Process,
                                        ***REMOVED*** Workflow
                                    });
                                }
                            )
                        }
                    );
                });
        }
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    displayName: route => {
        let process = route.props.detail.Process.process;
        return `Process ${process['object_repr']} (${process['start_date']})`;
    },
    __getState(){
        return {
            process: ProcessStore.getDetail(),
            ***REMOVED*** WorkflowStore.getDetail(),
            missing: ProcessStore.getMissing()
        }
    },
    getInitialState(){
        return this.__getState();
    },
    componentWillMount(){
        ProcessActions.calibrate();
    },
    update(status){
        if(status == ProcessStore.DETAIL){
            this.setState(this.__getState());
        }
    },
    load(){
        const wf = this.state.workflow;
        const sm = new StateMachine();

            sm.addStateClass({
                id: 'tasks.SimpleTask',
                Class: SimpleTaskRun
            });


        // I dont know if they come ordered, so i add all tasks first, an dependencies only after
        let map = {};

        // first states
        let ptasks = this.state.process.tasks;

        if(wf.tasks){
            for(let task of wf.tasks){
                let type = sm.getStateClass(task.type).Class;

                let opts = type.deserializeOptions(task)
                opts.disabled = true;

                let t=ptasks.find(pt => pt.task === task.hash);

                opts.assignee = t.users.reduce((prev, curr, i)=>{
                                        if(i == 0)
                                            return ''+curr.user;

                                        return `${prev},${curr.user}`;
                                    },''
                                );

                opts.deadline = t.deadline;
                opts.ptask = t;

                let state = sm.stateFactory(task.sortid, type, opts);

                map[task.hash] = state;

                sm.addState(state);
            }

            // then dependencies
            for(let task of wf.tasks)
                for(let dep of task.dependencies)
                    sm.addDependency(map[task.hash], map[dep.dependency]);
        }

        return sm;
    },
    closePopup(){
        ProcessActions.calibrate();
    },
    save(){

    },
    render() {
        let params = this.context.router.getCurrentParams();

        if(params.mode && !(params.mode === 'edit' || params.mode === 'view'))
            this.context.router.replaceWith('/404');

        let sm = this.load();

        return (
            <span>
                {this.state.missing.length > 0?
                    <Modal title="Missing information"
                        message={<span>You have to specify deadlines and assignee's for all tasks.<br />
                            <br />
                            The following tasks don't have deadlines or assignee's:
                            <ul>
                                {this.state.missing.map((state) => {
                                        return <li key={state.name}>{state.name}</li>;
                                })}
                            </ul>

                            </span>}
                        success={this.closePopup} close={this.closePopup}
                    />
                :''}
                <StateMachineComponent key={'teste'+params.mode}
                    extra={
                        <span>
                            <PermissionsBar
                                link="ProcessEdit"
                                editable={params.mode === 'edit'}
                                runnable={params.mode === 'run'}
                                showRun={false}
                                object={params.object}
                                {...this.state.workflow.permissions} />
                            <div className="row">
                                <div className="col-md-5">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <span className="input-group-addon" id="startdate">
                                                <strong>Start Date</strong>
                                            </span>
                                            <input className="form-control" readOnly value={this.state.process['start_date']} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-5">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <span className="input-group-addon" id="enddate">
                                                <strong>End Date</strong>
                                            </span>
                                            <input className="form-control" readOnly value={this.state.process['end_date'] || '---'} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <ProcessStatus label="True" rowData={{status: this.state.process.status}} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{backgroundColor: '#CFCFCF', width: '100%', height: '10px'}}>
                            <div title={`${this.state.process.progress}% completed`} style={{backgroundColor: '#19AB27', width: `${this.state.process.progress}%`, height: '10px'}}></div>
                            &nbsp;</div>
                            <ProcessLabel />
                        </span>
                    }
                    title={this.state.workflow.title}
                    editable={params.mode === 'edit'}
                    save={this.save}
                    saveLabel={<span><i className="fa fa-floppy-o"></i> &nbsp;Save Process</span>}
                    initialSm={sm}
                    savebar={!params.mode || params.mode === 'view'? false: true}
                    {...this.props}/>
            </span>
        );
    }
});

