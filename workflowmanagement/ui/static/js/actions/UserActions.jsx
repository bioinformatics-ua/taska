'use strict';
import Reflux from 'reflux';
import {ListLoader, DetailLoader} from './api.jsx'
// Each action is like an event channel for one specific event. Actions are called by components.
// The store is listening to all actions, and the components in turn are listening to the store.
// Thus the flow is: User interaction -> component calls action -> store reacts and triggers -> components update
const UserActions = Reflux.createActions([
    'loadSuccess',
    'loadUser',
    'setUsername',
    'setPassword',
    'login',
    'logout',
    'loginFailed',
    'setRememberMe',
    'loginSuccess'
]);

let loader = new DetailLoader({model: 'account', hash: 'me'});

UserActions.loadUser.listen(function (callback=null) {
    if(callback != null)
        loader.load(
            function(data){
                UserActions.loadSuccess(data);
                callback(data);
            }
        );
    else
        loader.load(UserActions.loadSuccess);
});

export default UserActions;
