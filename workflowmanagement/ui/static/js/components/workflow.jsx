'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import WorkflowActions from '../actions/WorkflowActions.jsx';

import WorkflowStore from '../stores/WorkflowStore.jsx';

import {StateMachineComponent} from '../react-statemachine/component.jsx';

import {StateMachine, SimpleState} from '../react-statemachine/classes.jsx';

import {SimpleTask, SimpleTaskRun} from './reusable/states/SimpleTask.jsx';

import Toggle from 'react-toggle';

const PermissionsBar = React.createClass({
    getDefaultProps() {
        return {
            editable: true,
            object: undefined
        };
    },
    render(){
        return (<span>
                <div className="form-group">
                  <div className="input-group">
                        <span className="input-group-addon" id="permissions">
                            <strong>Permissions</strong>
                        </span>
                        <div className="form-control">
                            <span className="selectBox">
                                <Toggle id="public"
                                    checked={this.props.public}
                                    defaultChecked={this.props.public}
                                    onChange={this.props.setPublic} disabled={!this.props.editable} />
                                <span className="selectLabel">&nbsp;Public</span>
                            </span>
                          <span className="selectBox">
                              <Toggle id="searchable"
                                checked={this.props.searchable}
                                defaultChecked={this.props.searchable}
                                onChange={this.props.setSearchable} disabled={!this.props.editable} />
                              <span className="selectLabel">&nbsp;Searchable</span>
                          </span>
                          <span className="selectBox">
                              <Toggle id="public"
                                checked={this.props.forkable}
                                defaultChecked={this.props.searchable}
                                onChange={this.props.setForkable} disabled={!this.props.editable} />
                              <span className="selectLabel">&nbsp;Forkable</span>
                          </span>
                        </div>
                </div>
                    <div  style={{zIndex: 200, position: 'absolute', right: '15px', bottom: '-40px'}}>
                    {!this.props.editable && !this.props.runnable ?
                        <Link className="btn btn-warning" to="WorkflowEdit"
                        params={{object: this.props.object, mode:'edit'}}>
                        <i className="fa fa-pencil"></i> &nbsp;Edit
                        </Link>
                    :''}

                    &nbsp;{!this.props.runnable && !this.props.editable?
                        <Link className="btn btn-primary" to="WorkflowEdit"
                        params={{object: this.props.object, mode:'run'}}>
                        <i className="fa fa-play"></i> &nbsp;Run
                        </Link>
                    :''}
                    </div>
                </div>

                </span>
        );
    }
});

export default React.createClass({
    mixins: [   Router.Navigation,
                Authentication,
                Reflux.listenTo(WorkflowStore, 'update')],
    statics: {
        fetch(params) {

            if(params.object == 'add'){

                return new Promise(function (fulfill, reject){
                    WorkflowStore.resetDetail();
                    fulfill({title: 'New study'});
                });
            }
            return WorkflowActions.loadDetailIfNecessary.triggerPromise(params.object).then(
                (workflow) => {
                    return workflow
                }
            );
        }
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    displayName: route => {

        return `Workflow ${route.props.detail.Workflow.title}`;
    },
    __getState(){
        return {
            ***REMOVED*** WorkflowStore.getWorkflow()
        }
    },
    getInitialState(){
        return this.__getState();
    },
    update(status){
        if(status == WorkflowStore.DETAIL){
            console.log('update');
            this.setState(this.__getState());
        }
    },
    load(run){
        const wf = this.state.workflow;
        const sm = new StateMachine();

        console.log(sm);
        if(run)
            sm.addStateClass({
                id: 'tasks.SimpleTask',
                Class: SimpleTaskRun
            });
        else
            sm.addStateClass({
                id: 'tasks.SimpleTask',
                Class: SimpleTask
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
    save(data){
        WorkflowActions.setWorkflow(data);
    },
    setPublic(e){
        WorkflowActions.setPublic(e.target.checked);
    },
    setSearchable(e){
        WorkflowActions.setSearchable(e.target.checked);
    },
    setForkable(e){
        WorkflowActions.setForkable(e.target.checked);
    },
    runProcess(data){
        WorkflowActions.runProcess(data);
    },
    render() {
        let params = this.context.router.getCurrentParams();
        console.log(params);
        console.log(params.mode === 'edit');
        if(params.mode && !(params.mode === 'edit' || params.mode === 'view' || params.mode === 'run'))
            this.context.router.replaceWith('/404');
        return (
            <span>
                <StateMachineComponent
                    extra={
                        <PermissionsBar
                            editable={params.mode === 'edit'}
                            runnable={params.mode === 'run'}
                            setPublic={this.setPublic}
                            setSearchable={this.setSearchable}
                            setForkable={this.setForkable}
                            object={params.object}
                            runProcess={this.runProcess}
                            {...this.state.workflow.permissions} />
                    }
                    editable={params.mode === 'edit'}
                    save={params.mode === 'run'? this.runProcess:this.save}
                    saveLabel={params.mode !== 'run'?
                    <span><i className="fa fa-floppy-o"></i> &nbsp;Save Study</span>
                    : <span><i className="fa fa-play"></i> Run</span>}
                    initialSm={this.load(params.mode === 'run')}
                    savebar={!params.mode || params.mode === 'view'? false: true}
                    {...this.props}/>
            </span>
        );
    }
});

