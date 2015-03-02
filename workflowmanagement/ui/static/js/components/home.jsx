'use strict';

import React from 'react';
import Reflux from 'reflux';

import {HistoryTable} from './reusable/history.jsx';
import {WorkflowTable} from './reusable/workflow.jsx';
import {ProcessTable} from './reusable/process.jsx';
import {RequestTable} from './reusable/request.jsx';

import UserActions from '../actions/UserActions.jsx';
import UserStore from '../stores/UserStore.jsx';

export default React.createClass({
  displayName: "",
    mixins: [Reflux.listenTo(UserStore, 'update')],
    __getState: function(){
      return {
        user: UserStore.getUser(),
        username: UserStore.getUsername(),
        password: UserStore.getPassword(),
        remember_me: UserStore.getRememberMe(),
        failed: UserStore.getFailed()
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
        UserActions.login({
          username: this.refs.usr.getDOMNode().value.trim(),
          password: this.refs.pwd.getDOMNode().value.trim(),
          remember: this.refs.rmb.getDOMNode().checked
        });
      }
    },
  render: function () {
    console.log(this.state.user.authenticated);
    if(this.state.user.authenticated === false){
      return (
          <div className="container">
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
                <a href="#" className="pull-right need-help">Forgot password? </a><span className="clearfix"></span>
                </form>
            </div>
            <a href="#" className="text-center new-account">Create an account </a>
        </div>
    </div>
</div>
        )
    }
    // else
    return <LoggedInHome />
  }
});

const LoggedInHome = React.createClass({
  render: function(){
    return (
          <div className="row">
              <div className="col-md-6">
                <WorkflowTable />
              </div>
              <div className="col-md-6">
                <ProcessTable />
              </div>
              <div className="col-md-6">
                <RequestTable />
              </div>
              <div className="col-md-6">
                <HistoryTable />
              </div>
          </div>
      );
  }
})
