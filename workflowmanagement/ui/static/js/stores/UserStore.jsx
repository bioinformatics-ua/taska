'use strict';
import Reflux from 'reflux';
import UserActions from '../actions/UserActions.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx'

import {Login} from '../actions/api.jsx'

let loader = new DetailLoader({model: 'account', hash: 'me'});

export default Reflux.createStore({
    listenables: [UserActions],

    init: function () {
        this.__userdata = {};
        this.__loaded = false;
        this.__failed = false;

    },
    getUser: function(){
        return this.__userdata;
    },
    getFailed: function(){
        return this.__failed;
    },
    loggedIn: function(){
        return this.__userdata.email != undefined;
    },
    onLoginFailed: function(){
        this.__failed = true;

        this.trigger();
    },
    // Actions handlers (declared on UserActions, and implemented here)
    onLoadUser: function (callback=null) {
        if(callback != null)
            loader.load(
                function(data){
                    UserActions.loadSuccess(data);
                    callback(data);
                }
            );
        else
            loader.load(UserActions.loadSuccess);
    },
    onLoadIfNecessary: function (callback=null) {
        if(this.loaded){
            if(callback != null)
                callback(this.__userdata);
        } else {
            this.onLoadUser(callback)
        }
    },
    onLoadSuccess: function (data) {
        this.__userdata = data;
        if(data.email != undefined){
            this.loaded = true;
        }
        this.trigger();
    },
    onLogin: function(data){
        let log = new Login({
            'username': data.username,
            'password': data.password,
            'remember': data.remember
        });
       let callback = data.callback;
       let success = function(data){
            UserActions.loginSuccess(data);
            callback();

        };

        log.authenticate(success, UserActions.loginFailed);
    },
    onLoginSuccess: function(data){
        if(data.authenticated){
            UserActions.loadUser();
        } else {
            UserActions.loginFailed();
        }

    },
    onLogout: function(callback){
        let log = new Login({});
        let self = this;
        log.logout(function(data){
            self.__loaded = false;
            self.__userdata = {};

            UserActions.logoutSuccess(data);
            if(callback)
                callback();
        });
    },
    onLogoutSuccess: function(data){
        if(data.authenticated === false)
            UserActions.loadUser()

    }
});
