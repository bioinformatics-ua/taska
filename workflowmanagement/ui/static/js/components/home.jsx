'use strict';

import React from 'react';

import {HistoryTable} from './reusable/history.jsx';
import {WorkflowTable} from './reusable/workflow.jsx';
import {ProcessTable} from './reusable/process.jsx';


export default React.createClass({
  displayName: "",
  render: function () {
    return (
        <div className="row">
            <div className="col-md-6">
              <WorkflowTable />
            </div>
            <div className="col-md-6">
              <HistoryTable />
            </div>
            <div className="col-md-6">
              <ProcessTable />
            </div>
        </div>
    );
  }
});
