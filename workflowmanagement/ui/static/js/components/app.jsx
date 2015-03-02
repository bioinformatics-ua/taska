'use strict';

import React from 'react';
import {RouteHandler, Link, State} from 'react-router';
import Breadcrumbs from 'react-breadcrumbs';
import {Tab, UserDropdown} from './reusable/navigation.jsx';

export default React.createClass({
  displayName: "Home",
  render: function(){
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
          <RouteHandler/>
        </div>
        <footer>© Ricardo Ribeiro & University of Aveiro - 2015</footer>
      </div>
    );
  }
});
