'use strict';
import Reflux from 'reflux';
import UserActions from '../actions/UserActions.jsx';

export default Reflux.createStore({
    listenables: [UserActions],

    init: function () {
        this.__user = {};
    },
    onLoadSuccess: function (data) {
        this.__user = data;

        this.trigger();
    },
    getUser: function(){
        return this.__user;
    }
});
