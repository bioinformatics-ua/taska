'use strict';
import Reflux from 'reflux';
// Each action is like an event channel for one specific event. Actions are called by components.
// The store is listening to all actions, and the components in turn are listening to the store.
// Thus the flow is: User interaction -> component calls action -> store reacts and triggers -> components update
const StateMachineActions = Reflux.createActions([
    'calibrate',
    'addState',
    'moveState',
    'deleteState',
    'duplicateState',
    'addDependency',
    'deleteDependency',
    'select',
    'clearSelect',
    'setTitle',
    'insertAbove',
    'removeRow',
    'setStateTitle',
    'setDetailVisible',
    'dataChange',
    'undo',
    'redo'
]);

export default StateMachineActions;
