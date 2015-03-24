'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import WorkflowActions from '../actions/WorkflowActions.jsx';

import WorkflowStore from '../stores/WorkflowStore.jsx';

import {StateMachineComponent} from '../react-statemachine/component.jsx';

import {StateMachine, SimpleState} from '../react-statemachine/classes.jsx';

import SimpleTask from './reusable/states/SimpleTask.jsx';

import Toggle from 'react-toggle';

const PermissionsBar = React.createClass({
    render(){
        return (<div className="form-group">
                  <div className="input-group">
                        <span className="input-group-addon" id="permissions">
                            <strong>Permissions</strong>
                        </span>
                        <div className="form-control">
                            <span className="selectBox">
                                <Toggle id="public"
                                    checked={this.props.public}
                                    defaultChecked={this.props.public}
                                    onChange={this.props.setPublic} />
                                <span className="selectLabel">&nbsp;Public</span>
                            </span>
                          <span className="selectBox">
                              <Toggle id="searchable"
                                checked={this.props.searchable}
                                defaultChecked={this.props.searchable}
                                onChange={this.props.setSearchable} />
                              <span className="selectLabel">&nbsp;Searchable</span>
                          </span>
                          <span className="selectBox">
                              <Toggle id="public"
                                checked={this.props.forkable}
                                defaultChecked={this.props.searchable}
                                onChange={this.props.setForkable} />
                              <span className="selectLabel">&nbsp;Forkable</span>
                          </span>
                        </div>
                </div></div>);
    }
});

export default React.createClass({
    mixins: [   Router.Navigation, Router.State,
                Authentication,
                Reflux.listenTo(WorkflowStore, 'update')],
    statics: {
        fetch(params) {

            if(params.object == 'add')
                return new Promise(function (fulfill, reject){
                    fulfill({title: 'New study'});
                });

            return WorkflowActions.loadDetailIfNecessary.triggerPromise(params.object).then(
                (workflow) => {
                    console.log(workflow);
                    return workflow
                }
            );
        }
    },
    displayName: route => {
        return `Workflow ${route.props.detail.Workflow.title}`;
    },
    __getState(){
        console.log(WorkflowStore.getWorkflow());
        return {
            ***REMOVED*** WorkflowStore.getWorkflow()
        }
    },
    getInitialState(){
        return this.__getState();
    },
    update(status){
        if(status == WorkflowStore.DETAIL)
            this.setState(this.__getState());
    },
    load(){
        const wf = this.state.workflow;
        const sm = new StateMachine();

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
    render() {
        console.log('RENDER');
        return (
            <span>
              <StateMachineComponent
                    extra={
                        <PermissionsBar setPublic={this.setPublic}
                            setSearchable={this.setSearchable}
                            setForkable={this.setForkable}
                            {...this.state.workflow.permissions} />
                    }
                    save={this.save}
                    initialSm={this.load()
                }
              editable={true} {...this.props}/>
            </span>
        );
    }
});

