'use strict';

import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';
import Router from 'react-router';

import UserActions from '../../actions/UserActions.jsx';
import UserStore from '../../stores/UserStore.jsx';

import {CheckLog} from '../../mixins/component.jsx';

export default React.createClass({
    displayName: "Login",
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    mixins: [Reflux.listenTo(UserStore, 'update'), CheckLog],
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
    __login: function(e){
        e.preventDefault();
        if(this.refs.usr != "" && this.refs.pwd != ""){

            var nextPath = this.context.router.getCurrentQuery().nextPath;
            let self = this;
            UserActions.login({
              username: this.refs.usr.getDOMNode().value.trim(),
              password: this.refs.pwd.getDOMNode().value.trim(),
              remember: this.refs.rmb.getDOMNode().checked,
              callback: function(have_tasks){
                    console.log('LOGIN CALLBACK');
                    if (nextPath) {
                        self.context.router.transitionTo(nextPath);
                    } else {
                        if(have_tasks)
                            self.context.router.replaceWith('MyTasks');
                        else
                            self.context.router.replaceWith('app');
                    }
              }
            });
        }
    },
    render(){
        return <ul key="loggedout" className="nav navbar-nav navbar-right">
                    <li className="dropdown">
                        <a href="#" className="dropdown-toggle boldit" data-toggle="dropdown" role="button" aria-expanded="false">
                            <i className="fa fa-user"></i> LOGIN <span className="caret"></span>
                        </a>
                        <ul className="dropdown-menu" role="menu">
                            <li className="li-login">
                                <form className="form-signin" onSubmit={this.__login}>

                                <input name="username" ref="usr" type="text" className="form-control" placeholder="Email" required autofocus />
                                <input name="password" ref="pwd" type="password" className="form-control" placeholder="Password" required />

                                {this.state.failed ? (<div className="alert alert-danger" role="alert">Login failed</div>) : ''}

                                <button
                                className="btn btn-sm btn-primary btn-block"
                                type="submit"><i className="fa fa-sign-in"></i> &nbsp;Sign in</button>
                                <label className="checkbox pull-left">
                                    <input defaultChecked="true" ref="rmb" name="remember_me" type="checkbox" value="remember-me" />
                                    Remember me
                                </label>
                                <Link className="pull-right need-help" to="forgotten">Forgot password ?</Link>
                                </form>
                                <Link to="register" className="text-center new-account">Create an account </Link>
                            </li>
                        </ul>
                    </li>
               </ul>;
    }
})