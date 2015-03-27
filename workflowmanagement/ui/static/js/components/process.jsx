'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import {Modal, PermissionsBar} from './reusable/component.jsx';

import WorkflowActions from '../actions/WorkflowActions.jsx';

import ProcessActions from '../actions/ProcessActions.jsx';

import WorkflowStore from '../stores/WorkflowStore.jsx';

import ProcessStore from '../stores/ProcessStore.jsx';

import {StateMachineComponent} from '../react-statemachine/component.jsx';

import {StateMachine, SimpleState} from '../react-statemachine/classes.jsx';

import {SimpleTask, SimpleTaskRun} from './reusable/states/SimpleTask.jsx';

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
        return `Process ${route.props.detail.Process.process['object_repr']}`;
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
        if(wf.tasks){
            for(let task of wf.tasks){
                let type = sm.getStateClass(task.type).Class;
                let state = sm.stateFactory(task.sortid, type, type.deserializeOptions(task));

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
                        <PermissionsBar
                            editable={params.mode === 'edit'}
                            runnable={params.mode === 'run'}
                            object={params.object}
                            {...this.state.workflow.permissions} />
                    }
                    title={this.props.detail.Process.workflow.title}
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

