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

import {CurrentTaskTable} from './currenttasks.jsx';
import {FutureTaskTable} from './futuretask.jsx';


const TaskTabber = React.createClass({
    getInitialState: function() {
        return {};
    },
    update: function(data){
        this.setState(this.getState());
    },
  render: function () {
    return  <div className="panel panel-default panel-overflow  griddle-pad">
              <div className="panel-heading">
                <i className="fa fa-tasks pull-left"></i>
                <h3 style={{position: 'absolute', width: '95%'}} className="text-center panel-title">Tasks</h3>
              </div>
              <div className="panel-body tasktab-container">
              <Tabs>
                <Tabs.Panel title={<span><i className="fa fa-play"></i> &nbsp;Current Tasks</span>}>
                  <CurrentTaskTable />
                </Tabs.Panel>
                <Tabs.Panel title={<span><i className="fa fa-clock-o"></i> &nbsp;Scheduled Tasks</span>}>
                  <FutureTaskTable />
                </Tabs.Panel>
              </Tabs>
              </div>
            </div>;
  }

});

export default {TaskTabber}
