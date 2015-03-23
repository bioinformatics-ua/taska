'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import WorkflowActions from '../actions/WorkflowActions.jsx';

import {WorkflowStore} from '../stores/WorkflowStore.jsx';

import {StateMachineComponent} from '../react-statemachine/component.jsx';

import {StateMachine, SimpleState} from '../react-statemachine/classes.jsx';

import SimpleTask from './reusable/states/SimpleTask.jsx';

import Toggle from 'react-toggle';

const PermissionsBar = React.createClass({
    render(){
        console.log(this.props);
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
            return WorkflowActions.loadDetailIfNecessary.triggerPromise(params.object).then(
                (workflow) => {
                    return workflow
                }
            );
        }
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
        if(status == WorkflowStore.DETAIL)
            this.setState(this.__getState());
    },
    serializeStateMachine(){
        const sm = new StateMachine();

        sm.addStateClass({
            id: 'task.SimpleState',
            Class: SimpleState
        })
        sm.addStateClass({
            id: 'task.SimpleTask',
            Class: SimpleTask
        })

        let state1 = sm.stateFactory(1, SimpleState, {name: 'Fazer a cama'});
        let state2 = sm.stateFactory(2, SimpleTask, {name: 'Ir à padaria lanchar'});
        let state3 = sm.stateFactory(2, SimpleTask, {name: 'Ir comprar pão'});
        let state4 = sm.stateFactory(3, SimpleTask, {name: 'Ir para o trabalho'});

        sm.addState(state1);
        sm.addState(state2);
        sm.addState(state3);
        sm.addState(state4);

        sm.addDependency(state2, state1);
        sm.addDependency(state3, state1);
        sm.addDependency(state4, state2);
        sm.addDependency(state4, state3);

        return sm;
    },
    setPublic(e){
        WorkflowStore.setPublic(e.target.checked);
    },
    setSearchable(e){
        WorkflowStore.setSearchable(e.target.checked);
    },
    setForkable(e){
        WorkflowStore.setForkable(e.target.checked);
    },
    render() {
        return (
            <span>
              <StateMachineComponent
                extra={
                    <PermissionsBar setPublic={this.setPublic}
                        setSearchable={this.setSearchable}
                        setForkable={this.setForkable}
                        {...this.state.workflow.permissions} />
                } initialSm={this.serializeStateMachine()}
              editable={true} {...this.props}/>
            </span>
        );
    }
});

