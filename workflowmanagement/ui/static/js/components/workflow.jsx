'use strict';

import React from 'react';
import Router from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import WorkflowActions from '../actions/WorkflowActions.jsx';

import {WorkflowStore} from '../stores/WorkflowStore.jsx';

export default React.createClass({
    mixins: [ Router.Navigation, Router.State, Authentication],
    statics: {
        fetch(params) {
            return WorkflowActions.loadDetailIfNecessary.triggerPromise(params.object).then(
                (workflow) => {
                    return workflow
                }
            );
        }
    },
    displayName: route => {
        return `Workflow ${route.props.detail.Workflow.title}`;
    },
    render() {
        let initial = this.props.detail.Workflow;
        return (
          <div className="row">
          <div className="col-md-12">
                <div className="panel panel-default">
                    <div className="panel-body">
                        <div className="clearfix taskbar col-md-3">
                            <h3 className="task-type-title panel-title">Type of Tasks</h3>
                            <hr />
                            <div className="task-type col-md-12 col-xs-4 btn btn-default">
                            <i className="task-type-icon fa fa-2x fa-check"></i>&nbsp;
                             <span>Simple Task</span></div>
                        </div>
                        <div className="col-md-9">
                                <div className="row">
                              <div className="col-md-12">

                                    <div class="form-group">
                                        <input type="title" className="form-control"
                                        id="exampleInputEmail1" placeholder="Enter the workflow title" value={initial.title} />
                                      </div>
                                    <hr />
                                </div>
                              </div>
                              <div className="row">
                                <div className="col-md-12">
                                    <div id="state_machine_chart">Yello
                                    </div>
                                </div>
                              </div>
                              <div className="row">
                              <div className="col-md-12">
                              <button className="btn btn-primary pull-right">Save Workflow</button>
                              </div>
                              </div>

                        </div>
                    </div>
                </div>
          </div>
          </div>
        );
    }
});
