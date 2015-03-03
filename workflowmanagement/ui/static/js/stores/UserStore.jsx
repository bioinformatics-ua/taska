'use strict';
import Reflux from 'reflux';
import UserActions from '../actions/UserActions.jsx';

import {Login} from '../actions/api.jsx'

export default Reflux.createStore({
    listenables: [UserActions],

    init: function () {
        this.__userdata = {};

        this.__failed = false;
    },
    getUser: function(){
        return this.__userdata;
    },
    getFailed: function(){
        return this.__failed;
    },
    loggedIn: function(){
        return this.__userdata.email;
    },
    onLoginFailed: function(){
        this.__failed = true;

        this.trigger();
    },
    // Actions handlers (declared on UserActions, and implemented here)
    onLoadSuccess: function (data) {
        console.log(data);
        this.__userdata = data;
        this.trigger();
    },
    onLogin: function(data){
        let log = new Login({
            'username': data.username,
            'password': data.password,
            'remember': data.remember
        });

        log.authenticate(UserActions.loginSuccess, UserActions.loginFailed)
    },
    onLoginSuccess: function(data){
        if(data.authenticated){
            this.__userdata.authenticated = true;
            UserActions.loadUser()
        } else {
            UserActions.loginFailed()
        }

    },
    onLogout: function(data){

    }
});
