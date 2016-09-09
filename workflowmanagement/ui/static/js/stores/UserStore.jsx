'use strict';
import Reflux from 'reflux';
import UserActions from '../actions/UserActions.jsx';
import {ListLoader, SimpleListLoader, DetailLoader} from '../actions/api.jsx';

import {Login} from '../actions/api.jsx';

import {DetailStoreMixin, ListStoreMixin} from '../mixins/store.jsx';

import StateActions from '../actions/StateActions.jsx';

export default Reflux.createStore({
    listenables: [UserActions],
    mixins: [
        DetailStoreMixin.factory(
            new DetailLoader({model: 'account'}),
            'email',
            UserActions
        ),
        ListStoreMixin.factory(
            new SimpleListLoader({model: 'account'}),
            UserActions
        )
    ],
    init(){
        this.__loginfail = false;
        this.__success_register = false;
        this.__success_recover = false;
    },
    getUser(){

        if($.isEmptyObject(this.__detaildata) ||
            (this.__detaildata.authenticated == false && Object.keys(this.__detaildata).length == 1)){
            this.__detaildata = {
                profile:{
                    detail_mode: 2
                },
                authenticated: false
            };
        }

        return this.__detaildata
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
        if(data.authenticated === false){
            UserActions.loginFailed();
        } else {
            this.__detaildata=data;
        }
        this.trigger();
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
        if(data.authenticated === false){
            this.__detaildata = data;
            this.trigger();
        }
    },
    onLoadUsers(){
        console.log('load users');
        UserActions.loadListIfNecessary.triggerPromise().then(
            (users) => {
                return users;
            }
        );
    },
    onSaveUser(){
        let pass = this.__detaildata['password'];
        if(pass && pass.trim() != ''
            && pass != this.__detaildata['confirm_password'].trim()){
            StateActions.alert({
                'title':"Password doesn't match",
                'message': "The password and the confirmation of password entered don't match."
            });
        } else {
            let data = {
                'first_name': this.__detaildata['first_name'],
                'last_name': this.__detaildata['last_name'],
                'profile': this.__detaildata['profile']
            };
            if(pass)
                data.password = pass.trim();

            StateActions.loadingStart();
            UserActions.postDetail.triggerPromise('me', data).then(
                    (user) => {
                        StateActions.loadingEnd();
                        this.trigger(pass);
                    }
            );
        }
    },
    isEmail(email){
            return /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test( email );
    },
    onRegisterUser(){

        let email = this.__detaildata.email;
        let password = this.__detaildata.password;

        try{
            delete this.__detaildata['authenticated'];
        }catch(err){};

        if(!password || password.trim() == ''
            || password != this.__detaildata['confirm_password'].trim()){
            StateActions.alert({
                'title':"Password doesn't match or empty",
                'message': "The password and the confirmation of password entered don't match or are empty."
            });
        }
        else if(!(email && this.isEmail(email))){
            StateActions.alert({
                'title':"Email must be a valid email",
                'message': "The email must follow a pattern like <user>@<domain>"
            });
        }
        else {
            this.onMethodDetail('register', undefined, 'POST', this.__detaildata).then(
                (user) => {
                    StateActions.loadingEnd();

                    if(user.error){
                        StateActions.alert({
                            'title':"Error Registering User",
                            'message': user.error
                        });
                    } else {
                        this.__detaildata={};
                        this.__success_register=true;
                    }

                    this.trigger();
                }
            );
        }
    },
    onRecoverPassword(email){
        if(!(email && this.isEmail(email))){
            StateActions.alert({
                'title':"Email must be a valid email",
                'message': "The email must follow a pattern like <user>@<domain>"
            });
        }
        else {
            this.onMethodDetail('recover', undefined, 'POST', {email: email}).then(
                (user) => {
                    StateActions.loadingEnd();

                    if(user.error){
                        StateActions.alert({
                            'title':"Error recovering password.",
                            'message': user.error
                        });
                    } else {
                        this.__success_recover=true;
                    }

                    this.trigger();
                }
            );
        }
    },
    onChangePassword(hash, password){
        this.onMethodDetail('changepassword', undefined, 'POST', {
            hash: hash,
            password: password
        }).then(
            (user) => {
                StateActions.loadingEnd();

                if(user.error){
                    StateActions.alert({
                        'title':"Error changing password.",
                        'message': user.error
                    });
                } else {
                    this.__success_recover=true;
                }

                this.trigger();
            }
        );
    },
    hasRegistered(){
        return this.__success_register;
    },
    hasRecovered(){
        return this.__success_recover;
    },
    onApprove(email){
        this.onMethodDetail('activate', undefined, 'POST', {
            'email': email
        }).then(
            (response) => {
                StateActions.loadingEnd();

                if(response.error){
                    StateActions.alert({
                        'title':"Error Approving User",
                        'message': response.error
                    });
                } else {
                    StateActions.alert({
                        'title':"User approved Successfully",
                        'message': "The user has been approved successfully, and notified of your decision."
                    });
                }

                this.trigger();
            }
        );
    },
    onSetField(field, value){
        this.__detaildata[field] = value;

        //this.trigger();
    },
    onSetProfileField(field, value){
        if(!this.__detaildata.profile)
            this.__detaildata.profile = {};

        this.__detaildata.profile[field] = value;

        //this.trigger();
    },
    getUsers(){
        return this.__list || [];
    }
});
