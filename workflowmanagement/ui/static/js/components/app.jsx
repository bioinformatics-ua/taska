'use strict';

import Reflux from 'reflux';

import React from 'react';
import {RouteHandler, Link, State} from 'react-router';
import Breadcrumbs from 'react-breadcrumbs';
import {Tab, UserDropdown} from './reusable/navigation.jsx';

import UserActions from '../actions/UserActions.jsx';
import UserStore from '../stores/UserStore.jsx';

import StateActions from '../actions/StateActions.jsx';
import StateStore from '../stores/StateStore.jsx';

export default React.createClass({
  displayName: "Home",
    mixins: [Reflux.listenTo(UserStore, 'update'),
    Reflux.listenTo(StateStore, 'update')    ],
    __getState: function(){
      return {
        user: UserStore.getDetail(),
        failed: UserStore.getDetailFailed(),
        loading: StateStore.isLoading(),
      }
    },
    getInitialState: function() {
      return this.__getState();
    },
    update: function(data){
        this.setState(this.__getState());
    },
  render: function(){
    let test = function(){
      console.log('hello world');
    }
    return (
      <div>
        <header>
            <nav className="navbar navbar-default navbar-fixed-top">
              <div className="container">
                <!-- Brand and toggle get grouped for better mobile display -->
                <div className="navbar-header">
                  <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                  </button>
                  <Link className="navbar-brand" to="app">EMIF Study Manager</Link>
                </div>

                <!-- Collect the nav links, forms, and other content for toggling -->
                <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                  <ul className="nav navbar-nav">
                    <li>
                        <Tab to='about'>About</Tab>
                    </li>
                  </ul>
                  <UserDropdown url="api/account/me/" />
                </div><!-- /.navbar-collapse -->
              </div><!-- /.container-fluid -->
            </nav>
        </header>
        <div className="container">
          <Breadcrumbs separator='' />
          {this.state.loading ?<i className="fa fa-4x fa-cog fa-spin"></i>:''}
            <RouteHandler key={name} callback = {test} />
        </div>
        <footer>© Ricardo Ribeiro & University of Aveiro - 2015</footer>
      </div>
    );
  }
});
