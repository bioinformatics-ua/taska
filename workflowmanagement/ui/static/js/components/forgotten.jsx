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
    displayName: "Password Recovery",
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
        let email = this.refs.email.getDOMNode().value;

        if(email && email.trim() != ""){
            UserActions.recoverPassword(email);
        }
    },
    componentDidUpdate(){
        if(this.state.recovered==true){
            StateActions.alert({
                'title': 'Password sent',
                'message': 'An email has been sent, with the new password. Please consult your email.'
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
                        <h3>Recover password</h3>
                        <p>To recover your password, please introduce your email below. An email will be sent to you, with the new password.</p>
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="startdate">
                                    <strong>Email</strong>
                                </span>
                                <input ref="email" className="form-control" placeholder="Please introduce your email" defaultValue={''} />
                            </div>
                        </div>
                        <button type="submit" className="pull-right btn btn-primary">
                            <i className="fa fa-medkit"></i> &nbsp;Recover
                        </button>
                    </div>
                </div>
                </form>
            </span>);
    }
});
