'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link, State} from 'react-router';

import UserActions from '../../actions/UserActions.jsx';
import UserStore from '../../stores/UserStore.jsx';

var Tab = React.createClass({

  mixins: [ State ],

  render: function () {
    var isActive = this.isActive(this.props.to, this.props.params, this.props.query);
    var className = isActive ? 'active' : '';
    var link = (
      <Link {...this.props} />
    );
    return <li className={className}>{link}</li>;
  }

});

var UserDropdown = React.createClass({
      mixins: [Reflux.listenTo(UserStore, 'update')],
    __getState: function(){
      return {
        user: UserStore.getUser()
      }
    },
    getInitialState: function() {
      return this.__getState();
    },
    componentDidMount: function() {
      UserActions.loadUser();
    },
    update: function(){
      this.setState(this.__getState());
    },
  render: function () {
    if(this.state.user.authenticated === false){
      return <span></span>;
    }
    return <ul className="nav navbar-nav navbar-right">
                    <li className="dropdown">
                      <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">
                        <i className="fa fa-user"></i> {this.state.user.fullname} <span className="caret"></span>
                      </a>
                      <ul className="dropdown-menu user-login" role="menu">
                        <li className="user-details">
                            <strong>Email:</strong><br /> {this.state.user.email}
                            <hr />
                            <strong>Last Login:</strong><br /> {this.state.user.last_login}
                        </li>
                        <li className="divider"></li>
                        <li><a href="#"><i className="fa fa-sign-out"></i> Logout</a></li>
                      </ul>
                    </li>
                  </ul>;
  }

});

export {Tab, UserDropdown}
