'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import WorkflowActions from '../../actions/WorkflowActions.jsx';
import WorkflowStore from '../../stores/WorkflowStore.jsx';

import Griddle from 'griddle-react';

import {WorkflowOwner, WorkflowLink, WorkflowManage} from '../reusable/workflows/components.jsx';
import {TableComponentMixin} from '../../mixins/component.jsx';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';


const SpecialWorkflowTable = React.createClass({
    tableAction: WorkflowActions.load,
    tableStore: WorkflowStore,
    mixins: [Reflux.listenTo(WorkflowStore, 'update'), TableComponentMixin],
    getInitialState: function() {
        return {};
    },
    update: function(data){
        this.setState(this.getState());
    },
  render: function () {
    const columnMeta = [
      {
      "columnName": "check",
      "order": 1,
      "locked": false,
      "visible": true,
      "customComponent": WorkflowLink,
      "displayName": ""
      },
      {
      "columnName": "title",
      "order": 2,
      "locked": false,
      "visible": true,
      "customComponent": WorkflowLink,
      "displayName": "Title"
      },
      {
      "columnName": "owner_repr",
      "order": 3,
      "locked": true,
      "visible": true,
      "displayName": "Creator",
      "customComponent": WorkflowOwner,
      "cssClassName": "owner-td"
      },
      {
      "columnName": "hash",
      "order": 4,
      "locked": true,
      "visible": true,
      "customComponent": WorkflowManage,
      "cssClassName": "manage-td",
      "displayName": " ",
      "user": this.props.user
      }
    ];
    return  <div className="panel panel-default panel-overflow griddle-pad">
              <div className="panel-heading">
                <i className="fa fa-sitemap pull-left"></i>
                <h3 className="text-center panel-title"> Study Templates</h3>
                <Link style={{position: 'absolute', right: '10px', top: '7px', zIndex: 1002}} to="WorkflowEdit" params={{object: 'add', mode: 'edit'}} className="pull-right btn btn-xs btn-success"><i className="fa fa-plus"></i> Create study template</Link>
              </div>
              <Griddle
                  noDataMessage={<center>You don't have any study templates.</center>}
                  {...this.commonTableSettings(false)}
                  columns={["check", "title", "owner_repr", "hash"]}
                  columnMetadata={columnMeta} />
            </div>;
  }
});

export default {SpecialWorkflowTable};