'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import HistoryActions from '../../actions/HistoryActions.jsx';
import HistoryStore from '../../stores/HistoryStore.jsx';

import Griddle from 'griddle-react';

import {Loading} from './component.jsx'

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

var HistoryEventIcon = React.createClass({
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

    mixins: [Reflux.listenTo(HistoryStore, 'update')],

    __getState: function(){
      return {
            entries: HistoryStore.getHistory(),
            currentPage: HistoryStore.getPage(),
            maxPages: HistoryStore.getMaxPage(),
            externalResultsPerPage: HistoryStore.getPageSize()
      }
    },
    getInitialState: function() {
        return {
            entries: HistoryStore.getHistory(),
            currentPage: HistoryStore.getPage(),
            maxPages: HistoryStore.getMaxPage(),
            externalResultsPerPage: HistoryStore.getPageSize(),
            externalSortColumn: null,
            externalSortAscending: true
        };
    },
    componentDidMount: function() {
        this.setPage(0);
    },
    update: function(data){
        this.setState(this.__getState());
    },
    loadUserData: function() {
      HistoryActions.load();
    },
    //what page is currently viewed
    setPage: function(index){
      console.log(`Set page ${index}`);
      HistoryActions.load(index);
    },
    //this will handle how the data is sorted
    sortData: function(sort, sortAscending, data){
    },
    //this changes whether data is sorted in ascending or descending order
    changeSortDirection: function(sort, sortAscending){
    },
    //this method handles the filtering of the data
    setFilter: function(filter){
    },
    //this method handles determining the page size
    setPageSize: function(size){
    },
    //this method handles change sort field
    changeSort: function(sort){
    },
  render: function () {
    if (!this.state.maxPages) {
        return <span/>;
    }


 /*const entries = this.state.entries.results.map(function (entry) {
      return (
        <tr key={entry.id}>
          <td>
            {translateAction(entry)}
            <br />
            <small>On {entry.date}</small>
          </td>
          <td>{translateEvent(entry.event)}</td>
        </tr>
      );
    });*/

    var columnMeta = [
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
      "customComponent": HistoryEventIcon,
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
              loadingComponent={Loading}
              columns={["object", "event"]} results={this.state.entries}
              useGriddleStyles={false}
              columnMetadata={columnMeta} />
            </div>;
  }

});

export {HistoryTable}
