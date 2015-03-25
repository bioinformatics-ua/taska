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
    mixins: [Reflux.listenTo(UserStore, 'update'), Router.Navigation, CheckLog],
    __getState: function(){
      return {
        failed: UserStore.loginFailed()
      }
    },
    getInitialState: function() {
      return this.__getState();
    },
    update: function(data){
        this.setState(this.__getState());
    },
    __login: function(){
      if(this.refs.usr != "" && this.refs.pwd != ""){
        var nextPath = this.getQuery().nextPath;
        let self = this;
        UserActions.login({
          username: this.refs.usr.getDOMNode().value.trim(),
          password: this.refs.pwd.getDOMNode().value.trim(),
          remember: this.refs.rmb.getDOMNode().checked,
          callback: function(){
                if (nextPath) {
                    self.transitionTo(nextPath);
                } else {
                    self.replaceWith('/');
                }
          }
        });
      }
    },
    render: function() {
      return (
          <div key="logincomponent" className="container">
            <div className="row">
                <div className="col-sm-6 col-md-4 col-md-offset-4">
                    <div className="account-wall">
                        <h1 className="text-center login-title">Please login</h1>
                        <img className="profile-img" src="static/images/user.png"
                            alt="" />
                        <form className="form-signin">
                        <input name="username" ref="usr" /*value={this.state.username}*/
                        /*onChange={this.setUsername}*/ type="text" className="form-control" placeholder="Email" required autofocus />
                        <input name="password" ref="pwd" /*value={this.state.password}*/
                        /*onChange={this.setPassword}*/ type="password" className="form-control" placeholder="Password" required />

                        {this.state.failed ? (<div className="alert alert-danger" role="alert">Login failed</div>) : ''}

                        <input value="Sign in" onClick={this.__login}
                        className="btn btn-lg btn-primary btn-block"
                        type="button" />
                        <label className="checkbox pull-left">
                            <input defaultChecked="true" ref="rmb"
                        /*onChange={this.setRememberMe}*/ name="remember_me" type="checkbox" value="remember-me" />
                            Remember me
                        </label>
                        <!--a href="#" className="pull-right need-help">Forgot password? </a><span className="clearfix"></span-->
                        </form>
                    </div>
                    <!--a href="#" className="text-center new-account">Create an account </a-->
                </div>
            </div>
        </div>);
      }
});
