'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import TaskActions from '../../actions/TaskActions.jsx';
import TaskStore from '../../stores/TaskStore.jsx';

import Griddle from 'griddle-react';

import {Loading, DeleteButton} from './component.jsx'
import {TableComponentMixin} from '../../mixins/component.jsx';

import moment from 'moment';

import Tabs from 'react-simpletabs';

import {getTableSize} from '../../page_settings.jsx';

import {CurrentTaskTable} from './currenttasks.jsx';
import {CompletedTaskTable} from './completedtasks.jsx';
import {RejectedTaskTable} from './rejectedtasks.jsx';

const TaskTabber = React.createClass({
    getInitialState: function() {
        return {};
    },
    update: function(data){
        this.setState(this.getState());
    },
  render: function () {
      let pageSize = getTableSize()+'px';
    return  <div  style={{height: pageSize}} className="panel panel-default panel-overflow">
              <div className="panel-heading">
                <i className="fa fa-tasks pull-left"></i>
                <h3 style={{position: 'absolute', width: '95%'}} className="text-center panel-title">My Tasks</h3>
              </div>
              <div className="panel-body tasktab-container">
              <Tabs>
                <Tabs.Panel title={<span><i className="fa fa-play"></i> &nbsp;Current Tasks</span>}>
                  <CurrentTaskTable />
                </Tabs.Panel>
                  <Tabs.Panel title={<span><i className="fa fa-check"></i> &nbsp;Completed Tasks</span>}>
                  <CompletedTaskTable />
                </Tabs.Panel>
                <Tabs.Panel title={<span><i className="fa fa-times"></i> &nbsp;Rejected Tasks</span>}>
                  <RejectedTaskTable />
                </Tabs.Panel>
              </Tabs>
              </div>
            </div>;
  }

});

export default {TaskTabber}
