'use strict';

import React from 'react';
import Router from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import WorkflowActions from '../actions/WorkflowActions.jsx';

import {WorkflowStore} from '../stores/WorkflowStore.jsx';

export default React.createClass({
    displayName: route => {
        return `Workflow ${route.getParams().object}`;
    },
    mixins: [ Router.Navigation, Router.State, Authentication],
    statics: {
        fetch(params) {
            return WorkflowActions.loadDetailIfNecessary.triggerPromise(params.object).then(
                (workflow) => {
                    console.log(workflow);
                    return workflow
                }

            );
        }
    },
    render() {
        console.log(this.props.callback);

        return (
          <div className="col-md-12">
            <div className="col-md-3">
                <div className="panel panel-default panel-overflow">
                  <div className="panel-heading">
                    <center><i className="fa fa-cogs pull-left"></i>
                        <h3 className="panel-title">Type of Tasks</h3>
                    </center>
                  </div>
                  <div className="panel-body">
                    body
                  </div>
                </div>
            </div>
            <div className="col-md-9">
                <div className="panel panel-default panel-overflow">
                  <div className="panel-heading">
                    <center><i className="fa fa-cogs pull-left"></i>
                        <h3 className="panel-title">NAme of task</h3>
                    </center>
                  </div>
                  <div className="panel-body">
                    body
                  </div>
                </div>
            </div>
          </div>
        );
    }
});
