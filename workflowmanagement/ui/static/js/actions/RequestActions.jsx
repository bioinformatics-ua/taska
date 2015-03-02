'use strict';
import Reflux from 'reflux';
import {ListLoader} from './api.jsx'
// Each action is like an event channel for one specific event. Actions are called by components.
// The store is listening to all actions, and the components in turn are listening to the store.
// Thus the flow is: User interaction -> component calls action -> store reacts and triggers -> components update
const RequestActions = Reflux.createActions([
    'loadSuccess',
    'load'
]);

let loader = new ListLoader({model: 'process/requests'});

RequestActions.load.listen(function (state) {
    loader.load(RequestActions.loadSuccess, state);
});

export default RequestActions;
