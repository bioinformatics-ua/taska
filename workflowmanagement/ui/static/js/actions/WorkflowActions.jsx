'use strict';
import Reflux from 'reflux';
import {ListLoader} from './api.jsx'
// Each action is like an event channel for one specific event. Actions are called by components.
// The store is listening to all actions, and the components in turn are listening to the store.
// Thus the flow is: User interaction -> component calls action -> store reacts and triggers -> components update
const WorkflowActions = Reflux.createActions([
    'loadSuccess',
    'load'
]);

let loader = new ListLoader({model: 'workflow'});

WorkflowActions.load.listen(function (state) {
    loader.load(WorkflowActions.loadSuccess, state);
});

export default WorkflowActions;
