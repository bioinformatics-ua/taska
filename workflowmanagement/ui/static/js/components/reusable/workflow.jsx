'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import WorkflowActions from '../../actions/WorkflowActions.jsx';
import WorkflowStore from '../../stores/WorkflowStore.jsx';

import Griddle from 'griddle-react';

import {Loading} from './component.jsx'

var WorkflowItem = React.createClass({
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

var WorkflowEventIcon = React.createClass({
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
const WorkflowTable = React.createClass({

    mixins: [Reflux.listenTo(WorkflowStore, 'update')],

    __getState: function(){
      return {
            entries: WorkflowStore.getList(),
            currentPage: WorkflowStore.getPage(),
            maxPages: WorkflowStore.getMaxPage(),
            externalResultsPerPage: WorkflowStore.getPageSize()
      }
    },
    getInitialState: function() {
        return {
            entries: WorkflowStore.getList(),
            currentPage: WorkflowStore.getPage(),
            maxPages: WorkflowStore.getMaxPage(),
            externalResultsPerPage: WorkflowStore.getPageSize(),
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
      WorkflowActions.load();
    },
    //what page is currently viewed
    setPage: function(index){
      console.log(`Set page ${index}`);
      WorkflowActions.load(index);
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

    var columnMeta = [
      {
      "columnName": "object",
      "order": 1,
      "locked": false,
      "visible": true,
      "customComponent": WorkflowItem
      },
      {
      "columnName": "event",
      "order": 2,
      "locked": false,
      "visible": true,
      "customComponent": WorkflowEventIcon,
      "cssClassName": "event-td"
      }
    ];



    return  <div className="panel panel-default panel-overflow">
              <div className="panel-heading">
                <center><i className="fa fa-Workflow pull-left"></i> <h3 className="panel-title">My Studies</h3></center>
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
              columns={["title"]} results={this.state.entries}
              useGriddleStyles={false}
              columnMetadata={columnMeta} />
            </div>;
  }

});

export {WorkflowTable}
