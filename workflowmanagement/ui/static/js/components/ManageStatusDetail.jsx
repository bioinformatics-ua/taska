'use strict';
import Router from 'react-router';
import React from 'react/addons';
import Reflux from 'reflux';

import {StatusDetailTable} from './reusable/statusdetail.jsx';
import {WaitingTaskTable} from './reusable/waitingtasks.jsx';
import {ProcessLabel, ProcessDetailBar, PermissionsBar} from './reusable/component.jsx';

import ProcessStore from '../stores/ProcessStore.jsx';
import WorkflowStore from '../stores/WorkflowStore.jsx';

import WorkflowActions from '../actions/WorkflowActions.jsx';
import ProcessActions from '../actions/ProcessActions.jsx';

import {Authentication} from '../mixins/component.jsx';

export default React.createClass({
  displayName: "",
  mixins: [Authentication,
            Reflux.listenTo(ProcessStore, 'update')],
  __getState(){
      return {
          process: ProcessStore.getDetail(),
          ***REMOVED*** WorkflowStore.getDetail()
      }
  },
  statics: {
        fetch(params) {
                return new Promise(function (fulfill, reject){

                    ProcessActions.loadDetailIfNecessary.triggerPromise(params.object).then(
                        (Process) => {
                            WorkflowActions.loadDetailIfNecessary.triggerPromise(Process.workflow).then(
                                (Workflow) => {
                                    fulfill({
                                        process: Process,
                                        ***REMOVED*** Workflow
                                    });
                                }
                            ).catch(ex=>reject(ex));
                        }
                    ).catch(ex=>reject(ex));
                });
        }
  },
  contextTypes: {
        router: React.PropTypes.func.isRequired
  },
  getInitialState(){
      return this.__getState();
  },
  render: function () {
    let params = this.context.router.getCurrentParams();
      console.log(this.state.process);

    return (<span>

            <div className="form-group">
                <div className="input-group">
                    <span className="input-group-addon" id="study-title"><strong>Title</strong></span>
                    <input type="title" className="form-control"
                           id="exampleInputEmail1" aria-describedby="study-title"
                           defaultValue={this.state.process['title']}
                           disabled={true}/>
                </div>
        </div>


        <PermissionsBar
            link="ProcessEdit"
            owner={this.state.workflow['owner_repr']}
            editable={params.mode === 'edit'}
            showEdit={false}
            runnable={params.mode === 'run'}
            extra={''}
            showRun={false}
            object={params.object}
            {...this.state.workflow.permissions} />


        <ProcessDetailBar
            startDate={this.state.process['start_date']}
            endDate={this.state.process['end_date'] || '---'}
            status={this.state.process.status}
            progress={this.state.process.progress} />

            <ProcessLabel />
            <hr />

            <div className="panel panel-default panel-overflow  griddle-pad">
                  <div className="panel-heading">
                    <i className="fa fa-tasks pull-left"></i>
                    <h3 style={{position: 'absolute', width: '95%'}} className="text-center panel-title">Assignee Status</h3>
                  </div>
                  <div className="panel-body tasktab-container">
                    <StatusDetailTable hash={params.object}/>
                  </div>
                </div>
      </span>);
  }
});