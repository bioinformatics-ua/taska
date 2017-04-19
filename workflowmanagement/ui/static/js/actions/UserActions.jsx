'use strict';
import Reflux from 'reflux';
// Each action is like an event channel for one specific event. Actions are called by components.
// The store is listening to all actions, and the components in turn are listening to the store.
// Thus the flow is: User interaction -> component calls action -> store reacts and triggers -> components update

import {DetailActionsMixin, ListActionsMixin} from '../mixins/actions.jsx';

const UserActions = Reflux.createActions($.extend({
    'login': {},
    'logout': {},
    'logoutSuccess': {},
    'loginFailed': {},
    'loginSuccess': {},
    'loadUsers': {},
    'saveUser': {},
    'setField': {},
    'setProfileField': {},
    'registerUser': {},
    'approve': {},
    'recoverPassword': {},
    'changePassword': {},
    'invite': {}
}, DetailActionsMixin, ListActionsMixin));

export default UserActions;
