'use strict';
import Router from 'react-router';
import React from 'react/addons';
import Reflux from 'reflux';

import {Authentication} from '../mixins/component.jsx';

export default React.createClass({
  displayName: "Profile",
  mixins: [Router.Navigation, Authentication],
  render: function () {
    return <span>profile</span>;
  }
});
