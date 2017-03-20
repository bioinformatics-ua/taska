'use strict';
import React from 'react/addons';

import {WorkflowTable} from '../reusable/workflows/workflow.jsx';
import {UserGrid} from '../usermanagment/usergrid.jsx';
import UserStore from '../../stores/UserStore.jsx';

import {Authentication} from '../../mixins/component.jsx';

export default React.createClass({
  displayName: "Studies",
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
  render: function(){
    return (<span>
            I decide to do this later
        </span>
    );
  }
});
