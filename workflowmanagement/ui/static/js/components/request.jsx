'use strict';

import React from 'react';
import Router from 'react-router';
import {Authentication} from '../mixins/component.jsx';


export default React.createClass({
    displayName: route => {
        return `Request ${route.getParams().object}`;
    },
    mixins: [ Router.Navigation, Authentication],
      render() {
        return (
          <div>
            <h1>Request</h1>
            <p>Coming soon...</p>
          </div>
        );
      }
});
