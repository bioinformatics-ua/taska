'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import HistoryActions from '../../actions/HistoryActions.jsx';
import HistoryStore from '../../stores/HistoryStore.jsx';

import Griddle from 'griddle-react';

import {Loading} from './component.jsx'

import {TableComponentMixin} from '../../mixins/component.jsx';

var HistoryItem = React.createClass({
  render: function(){
    function translateAction(entry){
      const link = <Link to={entry.object_type} params={entry}>{entry.object_repr}</Link>;
      var text;
      switch(entry.event){
        case 'Access':
          text = `${entry.actor_repr} has accessed`;
          return <span>{text} {link}</span>;
        case 'Add':
          text = `${entry.actor_repr} has added`;
          return <span>{text} {link}</span>;
        case 'Edit':
          text = `${entry.actor_repr} has made changes to`;
          return <span>{text} {link}</span>;
        case 'Delete':
          text = `${entry.actor_repr} has removed`;
          return <span>{text} <strong>{entry.object_repr}</strong></span>;
        default: return event;
      }
    }
    return (
            <span>
              {translateAction(this.props.rowData)}
              <br />
              <small>On {this.props.rowData.date}</small>
            </span>
      );
  }
});

var EventIcon = React.createClass({
  render: function(){
    function translateEvent(event){
      switch(event){
        case 'Access': return <i className="fa fa-folder-open thumb"></i>;
        case 'Add': return <i className="fa fa-plus thumb"></i>;
        case 'Edit': return <i className="fa fa-pencil thumb"></i>;
        case 'Delete': return <i className="fa fa-trash-o thumb"></i>;
        default: return event;
      }
    }
    return <span>
              {translateEvent(this.props.rowData.event)}
            </span>;
  }
});
const HistoryTable = React.createClass({
    // This is requires by the mixin, to know where to throw the action on events, i realize
    // the best case scenario for a mixin is be independently detachable, but I couldnt find a way to guess
    // the action destiny without explicitly identifying it
    tableAction: HistoryActions.load,
    tableStore: HistoryStore,
    mixins: [Reflux.listenTo(HistoryStore, 'update'), TableComponentMixin],

    getInitialState: function() {
        return {};
    },
    update: function(data){
        this.setState(this.getState());
    },
  render: function () {
    if (!this.state.maxPages) {
        return <span/>;
    }

    const columnMeta = [
      {
      "columnName": "object",
      "order": 1,
      "locked": false,
      "visible": true,
      "customComponent": HistoryItem
      },
      {
      "columnName": "event",
      "order": 2,
      "locked": false,
      "visible": true,
      "customComponent": EventIcon,
      "cssClassName": "event-td"
      }
    ];

    return  <div className="panel panel-default panel-overflow">
              <div className="panel-heading">
                <center><i className="fa fa-history pull-left"></i> <h3 className="panel-title"> History</h3></center>
              </div>
              <Griddle  useExternal={true} externalSetPage={this.setPage}
                        externalChangeSort={this.changeSort} externalSetFilter={this.setFilter}
                        externalSetPageSize={this.setPageSize} externalMaxPage={this.state.maxPages}
                        externalCurrentPage={this.state.currentPage}
                        resultsPerPage={this.state.externalResultsPerPage}
                        externalSortColumn={this.state.externalSortColumn}
                        externalSortAscending={this.state.externalSortAscending}
                        enableInfiniteScroll={true}
                        bodyHeight={375}
              tableClassName={"table table-striped"} showTableHeading={false}
              columns={["object", "event"]} results={this.state.entries}
              useGriddleStyles={false}
              columnMetadata={columnMeta} />
            </div>;
  }
});

export {HistoryTable}
