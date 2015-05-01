'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import FormActions from '../../actions/FormActions.jsx';
import FormStore from '../../stores/FormStore.jsx';

import Griddle from 'griddle-react';

import {Loading, DeleteButton} from './component.jsx'
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

const FormManage = React.createClass({
  delete(row){
    FormActions.deleteForm(row.hash);
  },
  render: function(){
    const row = this.props.rowData;
    const object = {object: row.hash}

    return <div className="btn-group" role="group" aria-label="...">
           <DeleteButton
              success={this.delete}
              identificator = {row}
              title={`Delete '${row["title"]}'`}
              message={`Are you sure you want to delete  '${row["title"]} ?'`}  />
           </div>;
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
      "customComponent": FormManage,
      "cssClassName": "process-td",
      "displayName": ""
      }
    ];
    return  <div className="panel panel-default panel-overflow  griddle-pad">
              <div className="panel-heading">
                <i className="fa fa-list-ul pull-left"></i>
                <h3 style={{position: 'absolute', width: '95%'}} className="text-center panel-title">My Forms</h3>
                <Link to="Form" params={{object: 'add'}} className="pull-right btn btn-xs btn-success"><i className="fa fa-plus"></i></Link>
              </div>
              <Griddle
                  {...this.commonTableSettings()}
                  columns={["title", "latest_update", "created_date"]}
                  columnMetadata={columnMeta} />
            </div>;
  }

});

export {FormTable}
