'use strict';

import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';
import Router from 'react-router';

import UserActions from '../actions/UserActions.jsx';
import UserStore from '../stores/UserStore.jsx';

import {CheckLog} from '../mixins/component.jsx';


export default React.createClass({
    displayName: "Login",
    mixins: [Reflux.listenTo(UserStore, 'update'), CheckLog],
    __getState: function(){
      return {
        failed: UserStore.loginFailed()
      }
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    getInitialState: function() {
      return this.__getState();
    },
    update: function(data){
        this.setState(this.__getState());
    },
    __login: function(e){
        e.preventDefault();
        if(this.refs.usr != "" && this.refs.pwd != ""){

            var nextPath = this.context.router.getCurrentQuery().nextPath;
            let self = this;
            UserActions.login({
              username: this.refs.usr.getDOMNode().value.trim(),
              password: this.refs.pwd.getDOMNode().value.trim(),
              remember: this.refs.rmb.getDOMNode().checked,
              callback: function(){
                    console.log('LOGIN CALLBACK');
                    if (nextPath) {
                        self.context.router.transitionTo(nextPath);
                    } else {
                        self.context.router.replaceWith('app');
                    }
              }
            });
        }
    },
    render: function() {
      return (
          <div key="logincomponent" className="container">
            <div className="clearfix row">
                <div className="col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4">
                    <div className="account-wall">
                        <h1 className="text-center login-title">Please login</h1>
                        <i className="fa fa-user profile-img"></i>
                        <form className="form-signin" onSubmit={this.__login}>

                        <input name="username" ref="usr" /*value={this.state.username}*/
                        /*onChange={this.setUsername}*/ type="text" className="form-control" placeholder="&#61664;&nbsp; Email" required autofocus />
                        <input name="password" ref="pwd" /*value={this.state.password}*/
                        /*onChange={this.setPassword}*/ type="password" className="form-control" placeholder="&nbsp;&#61475;&nbsp; Password" required />

                        {this.state.failed ? (<div className="alert alert-danger" role="alert">Login failed</div>) : ''}

                        <button
                        className="btn btn-lg btn-primary btn-block"
                        type="submit"><i className="fa fa-sign-in"></i> &nbsp;Sign in</button>
                        <label className="checkbox pull-left">
                            <input defaultChecked="true" ref="rmb"
                        /*onChange={this.setRememberMe}*/ name="remember_me" type="checkbox" value="remember-me" />
                            Remember me
                        </label>
                        {/*<a href="#" className="pull-right need-help">Forgot password? </a><span className="clearfix"></span>*/}
                        </form>
                    </div>
                    <Link to="register" className="text-center new-account">Create an account </Link>
                </div>
            </div>
        </div>);
      }
});
