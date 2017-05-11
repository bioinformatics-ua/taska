'use strict';
import Router from 'react-router';
import React from 'react/addons';
import Reflux from 'reflux';

import Select from 'react-select';

import UserStore from '../stores/UserStore.jsx';

import UserActions from '../actions/UserActions.jsx';
import StateActions from '../actions/StateActions.jsx';

import Toggle from 'react-toggle';

export default React.createClass({
    displayName: "Change Password",
    mixins: [Router.Navigation,
                Reflux.listenTo(UserStore, 'update')],
    statics: {
        fetch(params) {
            return new Promise(function (fulfill, reject){
                UserStore.init();
                fulfill({});
            });
        }
    },
    getState(){
        return {
            user: UserStore.getUser(),
            recovered: UserStore.hasRecovered()
        }
    },
    getInitialState(){
        return this.getState();
    },
    update(){
        this.setState(this.getState());
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    recover(e){
        e.preventDefault();

        let hash = this.context.router.getCurrentParams().hash;
        let password = this.refs.password.getDOMNode().value;
        let repeatpassword = this.refs.repeatpassword.getDOMNode().value;

        if(password != repeatpassword){
              StateActions.alert({
                'title': 'Passwords do not match',
                'message': 'The password does not match with the repeat password.'
            });
        }
        else if(password && password.trim() != ""){
            UserActions.changePassword(hash, password);
        }
    },
    componentDidUpdate(){
        if(this.state.recovered==true){
            StateActions.alert({
                'title': 'Password changed',
                'message': 'The password has been changed. Please login with the new password.'
            });
            this.context.router.transitionTo('home');
        }
    },
    render: function () {
        return (
            <span>
                <form onSubmit={this.recover}>
                <div className="row">
                    <div className="profileform col-md-8 col-md-offset-2">
                        <h3>Change password</h3>
                        <p>To change your password, please introduce the new password below.</p>
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="startdate">
                                    <strong>Password</strong>
                                </span>
                                <input ref="password" type="password" className="form-control" placeholder="Please introduce new password" defaultValue={''} />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="startdate">
                                    <strong>Repeat Password</strong>
                                </span>
                                <input ref="repeatpassword" type="password" className="form-control" placeholder="Please repeat new password" defaultValue={''} />
                            </div>
                        </div>
                        <button type="submit" className="pull-right btn btn-primary">
                            <i className="fa fa-floppy-o"></i> &nbsp;Change Password
                        </button>
                    </div>
                </div>
                </form>
            </span>);
    }
});
