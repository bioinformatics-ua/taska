'use strict';
import Reflux from 'reflux';
import UserActions from '../actions/UserActions.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx';

import {Login} from '../actions/api.jsx';

import {DetailStoreMixin} from '../mixins/store.jsx';

export default Reflux.createStore({
    listenables: [UserActions],
    mixins: [
        DetailStoreMixin.factory(
            new DetailLoader({model: 'account', hash: 'me'}),
            'email',
            UserActions
        )
    ],
    init(){
        this.__loginfail = false;
    },
    loggedIn: function(){
        return this.__detaildata.email != undefined;
    },
    onLoginFailed: function(){
        this.__loginfail = true;

        this.trigger();
    },
    loginFailed(){
        return this.__loginfail;
    },
    // Actions handlers (declared on UserActions, and implemented here)
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
            UserActions.loadDetail();
        } else {
            UserActions.loginFailed();
        }

    },
    onLogout: function(callback){
        let log = new Login({});
        let self = this;
        log.logout(function(data){
            self.__loginfail = false;
            UserActions.unloadDetail();

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
