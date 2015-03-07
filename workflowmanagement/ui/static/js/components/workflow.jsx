'use strict';

import React from 'react';
import Router from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import WorkflowActions from '../actions/WorkflowActions.jsx';

import {WorkflowStore} from '../stores/WorkflowStore.jsx';

import {StateMachineComponent} from '../react-statemachine/component.jsx';

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
    render() {
        return (
          <StateMachineComponent editable={true} {...this.props}/>
        );
    }
});
