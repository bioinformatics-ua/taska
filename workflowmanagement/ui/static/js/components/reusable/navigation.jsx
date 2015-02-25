'use strict';

import React from 'react';
import {RouteHandler, Link, State} from 'react-router';

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
    getInitialState: function() {
        return {user: {}};
    },
    componentDidMount: function() {
        this.loadUserData();
    },
    loadUserData: function() {
        $.ajax({
          url: this.props.url,
          dataType: 'json',
          success: function(data) {
            if (this.isMounted()) {
                this.setState({user: data});
            }
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(this.props.url, status, err.toString());
          }.bind(this)
        });
    },
  render: function () {

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
