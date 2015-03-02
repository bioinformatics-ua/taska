'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import RequestActions from '../../actions/RequestActions.jsx';
import RequestStore from '../../stores/RequestStore.jsx';

import Griddle from 'griddle-react';

import {Loading} from './component.jsx'
import {TableComponentMixin} from '../../mixins/component.jsx';

const RequestStatus = React.createClass({
  render: function(){
    const row = this.props.rowData;
  function translateStatus(type){
    switch(type){
      case 1:
        return <i className="fa fa-2x fa-exchange"></i>;
      case 2:
        return <i className="fa fa-2x fa-question-circle"></i>;
    }

  }
    return <center>
            {translateStatus(row.type)}
           </center>;
  }
});

const RequestLink = React.createClass({
  render: function(){
    const row = this.props.rowData;
    const object = {object: row.hash}
    return <small>
            <Link to="Request" params={object}>{row.title}</Link>
           </small>;
  }
});

const RequestUser = React.createClass({
  render: function(){
    const row = this.props.rowData;
    const object = {object: row.hash}
    return <small>{row.processtaskuser.user_repr}</small>;
  }
});


const RequestDate = React.createClass({
  render: function(){
    return <small>{this.props.rowData.date}</small>
  }
});


const RequestTable = React.createClass({
    tableAction: RequestActions.load,
    tableStore: RequestStore,
    mixins: [Reflux.listenTo(RequestStore, 'update'), TableComponentMixin],
    getInitialState: function() {
        return {};
    },
    update: function(data){
        this.setState(this.getState());
    },
  render: function () {
    const columnMeta = [
      {
      "columnName": "title",
      "order": 1,
      "locked": true,
      "visible": true,
      "customComponent": RequestLink,
      "displayName": "Title"
      },
      {
      "columnName": "processtaskuser",
      "order": 2,
      "locked": true,
      "visible": true,
      "customComponent": RequestUser,
      "displayName": "User"
      },
      {
      "columnName": "date",
      "order": 3,
      "locked": true,
      "visible": true,
      "displayName": "Date",
      "customComponent": RequestDate
      },
      {
      "columnName": "type",
      "order": 4,
      "locked": true,
      "visible": true,
      "customComponent": RequestStatus,
      "cssClassName": "request-td",
      "displayName": "Type"
      }
    ];
    return  <div className="panel panel-default panel-overflow">
              <div className="panel-heading">
                <center><i className="fa fa-cogs pull-left"></i><h3 className="panel-title">Received Requests</h3></center>
              </div>
              <Griddle
                  {...this.commonTableSettings()}
                  columns={["title", "processtaskuser",  "date","type"]}
                  columnMetadata={columnMeta} />
            </div>;
  }

});

export {RequestTable}
