'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import HistoryActions from '../../actions/HistoryActions.jsx';
import HistoryStore from '../../stores/HistoryStore.jsx';

const HistoryTable = React.createClass({

    mixins: [Reflux.listenTo(HistoryStore, 'update')],

    getInitialState: function() {
        return {entries: {}};
    },
    componentDidMount: function() {
        this.loadUserData();
    },
    update: function(data){
        this.setState(data);
    },
    loadUserData: function() {
      HistoryActions.load();
    },
  render: function () {
    if (!this.state.entries.count) {
        return <span/>;
    }

 const entries = this.state.entries.results.map(function (entry) {
      return (
        <tr key={entry.id}>
          <td>{entry.object_repr}</td>
          <td>{entry.event}</td>
          <td>{entry.object_type}</td>
          <td>{entry.date}</td>
          <td>{entry.actor}</td>
        </tr>
      );
    });

    return  <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">History</h3>
              </div>
              <div className="panel-body">
              <table className="table table-bordered table-stripped">
                {entries}
              </table>
              </div>
            </div>;
  }

});

export {HistoryTable}
