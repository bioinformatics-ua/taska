'use strict';
import Router from 'react-router';
import React from 'react/addons';
import Reflux from 'reflux';

import {GeneralHistoryTable} from './reusable/history.jsx';
import {WorkflowTable} from './reusable/workflow.jsx';
import {TaskTabber} from './reusable/task.jsx';
import {FormTable} from './reusable/form.jsx';

import UserStore from '../stores/UserStore.jsx';

import {Authentication} from '../mixins/component.jsx';

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
          <div className="row flex-container">
              <div className="col-md-6 flex-container flex-row">
                <FormTable />
              </div>
          </div>

      </span>);
  }
})