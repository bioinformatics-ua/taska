'use strict';
import Router from 'react-router';
import React from 'react/addons';
import Reflux from 'reflux';

import {HistoryTable} from './reusable/history.jsx';
import {WorkflowTable} from './reusable/workflow.jsx';
import {ProcessTable} from './reusable/process.jsx';
import {RequestTable} from './reusable/request.jsx';
import {TaskTable} from './reusable/task.jsx';


import {Authentication} from '../mixins/component.jsx';

export default React.createClass({
  displayName: "",
  mixins: [Authentication],
  render: function () {
    return <LoggedInHome />;
  }
});

const LoggedInHome = React.createClass({

  render: function(){
    return (<span>
          <div className="row flex-container">
              <div className="col-md-6 flex-container flex-row">
                <WorkflowTable />
              </div>
              <div className="col-md-6 flex-container flex-row">
                <ProcessTable />
              </div>
          </div>
          <div className="row flex-container">
              <div className="col-md-6 flex-container flex-row">
                <TaskTable />
              </div>
              <div className="col-md-6 flex-container flex-row">
                <RequestTable />
              </div>
          </div>
          <div className="row flex-container">
              <div className="col-md-12 flex-container flex-row">
                <HistoryTable />
              </div>

          </div>
      </span>);
  }
})
