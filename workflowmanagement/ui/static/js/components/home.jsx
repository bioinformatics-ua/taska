'use strict';

import React from 'react';

import {HistoryTable} from './reusable/history.jsx';

export default React.createClass({
  displayName: "",
  render: function () {
    return (
        <div>
            <div className="col-md-6 no-padding-left">
              <HistoryTable />
            </div>
            <div className="col-md-6 no-padding-right">
              <HistoryTable />
            </div>
            <div className="col-md-6 no-padding-left">
              <HistoryTable />
            </div>
            <div className="col-md-6 no-padding-right">
              <HistoryTable />
            </div>
        </div>
    );
  }
});
