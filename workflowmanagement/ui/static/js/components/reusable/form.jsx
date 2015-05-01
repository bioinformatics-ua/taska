'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import FormActions from '../../actions/FormActions.jsx';
import FormStore from '../../stores/FormStore.jsx';

import Griddle from 'griddle-react';

import {Loading} from './component.jsx'
import {TableComponentMixin} from '../../mixins/component.jsx';

import moment from 'moment';

const FormLink = React.createClass({
  render: function(){
    const row = this.props.rowData;
    const object = {name: row.title, object: row.hash}
    return <small>
            <Link to="Form" params={object}>{row.title}</Link>

           </small>;
  }
});

const FormCreate = React.createClass({
  render: function(){
    const row = this.props.rowData;
    return <small>{moment(row.created_date).fromNow()}</small>;
  }
});


const FormDate = React.createClass({
  render: function(){
    return <small>{moment(this.props.rowData.latest_update).fromNow()}</small>
  }
});


const FormTable = React.createClass({
    tableAction: FormActions.load,
    tableStore: FormStore,
    mixins: [Reflux.listenTo(FormStore, 'update'), TableComponentMixin],
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
      "customComponent": FormLink,
      "displayName": "Title"
      },
      {
      "columnName": "latest_update",
      "order": 2,
      "locked": true,
      "visible": true,
      "displayName": "Latest Update",
      "cssClassName": "date-td",
      "customComponent": FormDate
      },
      {
      "columnName": "created_date",
      "order": 3,
      "locked": true,
      "visible": true,
      "customComponent": FormCreate,
      "cssClassName": "date-td",
      "displayName": "Created Date"
      }
    ];
    return  <div className="panel panel-default panel-overflow  griddle-pad">
              <div className="panel-heading">
                <center><i className="fa fa-life-ring pull-left"></i><h3 className="panel-title">My Forms</h3></center>
              </div>
              <Griddle
                  {...this.commonTableSettings()}
                  columns={["title", "latest_update", "created_date"]}
                  columnMetadata={columnMeta} />
            </div>;
  }

});

export {FormTable}
