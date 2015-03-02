'use strict';
import Reflux from 'reflux';
import UserActions from '../actions/UserActions.jsx';

import {Login} from '../actions/api.jsx'

export default Reflux.createStore({
    listenables: [UserActions],

    init: function () {
        this.__userdata = {};

        // Username for login porpuses
        this.__username = "";
        this.__password = "";
        this.__remember_me = false;
        this.__failed = false;
    },
    getUser: function(){
        return this.__userdata;
    },
    getUsername: function(){
        return this.__username;
    },
    getPassword: function(){
        return this.__password;
    },
    getRememberMe: function(){
        return this.__remember_me;
    },
    getFailed: function(){
        return this.__failed;
    },
    onLoginFailed: function(){
        this.__failed = true;

        this.trigger();
    },
    // Actions handlers (declared on UserActions, and implemented here)
    onLoadSuccess: function (data) {
        this.__userdata = data;
        this.trigger();
    },
    onSetUsername: function(username){
        console.log(username);
        this.__username = username;

        this.trigger();
    },
    onSetPassword: function(password){
        this.__password = password;
        this.trigger();
    },
    onSetRememberMe: function(remember){
        this.__remember_me = remember;

        this.trigger();
    },
    onLogin: function(data){
        let log = new Login({
            'username': data.username,
            'password': data.password,
            'remember': data.remember
        });
        console.log("ON LOGIN");
        console.log(log);
        log.authenticate(UserActions.loginSuccess, UserActions.loginFailed)
    },
    onLoginSuccess: function(data){
        if(data.authenticated){
            this.__userdata.authenticated = true;
            UserActions.loadUser()
        } else {
            UserActions.loginFailed()
        }

    }
});
