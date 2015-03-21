'use strict';

import React from 'react';
import Router from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import WorkflowActions from '../actions/WorkflowActions.jsx';

import {WorkflowStore} from '../stores/WorkflowStore.jsx';

import {StateMachineComponent} from '../react-statemachine/component.jsx';

import {StateMachine, SimpleState} from '../react-statemachine/classes.jsx';

import SimpleTask from './reusable/states/SimpleTask.jsx';

export default React.createClass({
    mixins: [ Router.Navigation, Router.State, Authentication],
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
    render() {
        return (
        <span>
          <StateMachineComponent initialSm={this.serializeStateMachine()}
          editable={true} {...this.props}/>
        </span>
        );
    }
});
