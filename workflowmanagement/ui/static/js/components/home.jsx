'use strict';

import React from 'react/addons';

import UserStore from '../stores/UserStore.jsx';

import {Authentication} from '../mixins/component.jsx';
import {RouteHandler, Link, Router} from 'react-router';
import IntroPage from './reusable/intropage.jsx';

/*
export default React.createClass({
  displayName: "",
  mixins: [Authentication],
  render: function () {
    return <LoggedInHome redirect={true}/>;
  }
});*/

const HomeWithRedirect = React.createClass({
  displayName: "",
  mixins: [Authentication],
  render: function () {
    return <LoggedInHome redirect={true}/>;
  }
});

const Home = React.createClass({
  displayName: "",
  mixins: [Authentication],
  render: function () {
    return <LoggedInHome />;
  }
});


const LoggedInHome = React.createClass({
  __getState(){
    return {
        user: UserStore.getUser()
    }
  },
  getInitialState(){
    return this.__getState();
  },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
  render: function(){
     if(this.state.user.have_tasks && this.props.redirect)
     {
         this.context.router.replaceWith('MyTasks');
         return <span></span>;
     }
    return <div><IntroPage /></div>;
  }
})

export default {Home, HomeWithRedirect};