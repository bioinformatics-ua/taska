'use strict';

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
        this.setState({entries: data});
    },
    loadUserData: function() {
        $.ajax({
          url: this.props.url,
          dataType: 'json',
          success: function(data) {
            if (this.isMounted()) {
                this.setState({user: data});
            }
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(this.props.url, status, err.toString());
          }.bind(this)
        });
    },
  render: function () {
    if (!this.state.entries.count) {
        return <span/>;
    }
     const entries = this.state.entries.results.map(
            entry =>
            {entry.object}
            {entry.event}
            {entry.object_type}<br />
            );
    return  <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">History</h3>
              </div>
              <div className="panel-body">
                {{entries}}
              </div>
            </div>;
  }

});

export {HistoryTable}
