'use strict';

import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';
import Router from 'react-router';

import UserActions from '../actions/UserActions.jsx';
import UserStore from '../stores/UserStore.jsx';

import {CheckLog} from '../mixins/component.jsx';

import IntroPage from './reusable/intropage.jsx';

export default React.createClass({
    displayName: "Login",
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    render: function() {
      return (
          <span>
          <IntroPage buttonsDisabled={true}/>
          </span>);
      }
});
