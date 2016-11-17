'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';
import Router from 'react-router';
import UserActions from '../../actions/UserActions.jsx';
import UserStore from '../../stores/UserStore.jsx';

var Tab = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },
  render() {
    var isActive = this.context.router.isActive(this.props.to, this.props.params, this.props.query);

    var className = isActive ? 'active' : '';
    var link = (
      <Link {...this.props} />
    );
    return <li className={className}>{link}</li>;
  }

});

var UserDropdown = React.createClass({
      mixins: [Reflux.listenTo(UserStore, 'update'), Router.Navigation],
    __getState: function(){
      return {
        user: UserStore.getUser()
      }
    },
    getInitialState: function() {
      return this.__getState();
    },
    componentDidMount: function() {
    },
    update: function(){
      this.setState(this.__getState());
    },
    logout: function(){
      let self = this;
      console.log('LOGGING OUT');
      UserActions.logout(function(){
        self.context.router.replaceWith('login');
      });
    },
  render: function () {
    if(this.state.user.authenticated === false){
      return <span key="loggedout"></span>;
    }
    return <ul key="loggedin" className="nav navbar-nav navbar-right">
                    <li>
                        <Tab to='default' className="boldit"><i className="fa fa-tasks"></i> MY TASKS</Tab>
                    </li>
                    <li>
                        <Tab to='MyStudies' className="boldit"><i className="fa fa-sitemap"></i> MY STUDIES</Tab>
                    </li>
        
                    <li className="dropdown">
                        <a href="#" className="dropdown-toggle boldit" data-toggle="dropdown" role="button" aria-expanded="false">
                            <i className="fa fa-cogs"></i> MANAGE <span className="caret"></span>
                        </a>
                        <ul className="dropdown-menu user-login" role="menu">
                            <li>
                                <Tab to='Forms' className="boldit">Forms</Tab>
                            </li>
                            <li>
                                <Tab to='StudyTemplates' className="boldit">Workflow Templates</Tab>
                            </li>
                            <li>
                                <Tab to='StudyManagement' className="boldit">Studies</Tab>
                            </li>
                            <li>
                                <Tab to='MyRequests' className="boldit">Requests</Tab>
                            </li>
                        </ul>

                    </li>
                    <li>
                        <Tab to='help' className="boldit"><i className="fa fa-question-circle"></i> HELP</Tab>
                    </li>

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
                        <li>
                          <Link to="profile"><i className="fa fa-pencil-square-o"></i> Edit Profile</Link>
                        </li>
                        <li>
                            <Link to='about'><i className="fa fa-info-circle"></i> About Taska</Link>
                        </li>
                        <li className="divider"></li>
                        <li><a href="javascript:void(0)" onClick={this.logout}><i className="fa fa-sign-out"></i> Logout</a></li>
                      </ul>
                    </li>

                  </ul>;
  }

});

export {Tab, UserDropdown}
