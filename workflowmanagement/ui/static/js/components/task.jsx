'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import {Modal, PermissionsBar} from './reusable/component.jsx';

import TaskActions from '../actions/TaskActions.jsx';

import TaskStore from '../stores/TaskStore.jsx';

import moment from 'moment';

export default React.createClass({
    mixins: [   Router.Navigation,
                Authentication,
                Reflux.listenTo(TaskStore, 'update')],
    statics: {
        fetch(params) {
            return TaskActions.loadDetailIfNecessary.triggerPromise(params.object).then(
                (Task) => {
                    return Task;
                }
            );
        }
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    displayName: route => {
        return `Task ${route.props.detail.Task.task_repr}`;
    },
    __getState(){
        return {
            task: TaskStore.getDetail(),
        }
    },
    getInitialState(){
        return this.__getState();
    },
    componentWillMount(){
    },
    componentDidUpdate(){
    },
    update(status){
        if(status == TaskStore.DETAIL){
            this.setState(this.__getState());
        }
    },
    render() {
        let DetailRender = this.detailRender();

        let deadline = moment(this.state.task.deadline);
        return (
            <div className="task-detail row">
                <div className="col-md-12">
                    <div className="panel panel-default">
                        <div className="panel-body">
                            <div className="row">
                                <div className="col-md-9">
                                      <div className="form-group">
                                        <div className="input-group">
                                          <span className="input-group-addon"><strong>Task</strong></span>
                                          <span className="form-control">{this.state.task['task_repr']}</span>
                                        </div>
                                      </div>
                                      <div className="row">
                                        <div className="col-md-6">
                                          <div className="form-group">
                                            <div className="input-group">
                                              <span className="input-group-addon"><strong>Type</strong></span>
                                              <span className="form-control">{this.state.task.type}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <div className="input-group">
                                                  <span className="input-group-addon"><strong>Deadline</strong></span>
                                                  <span className="form-control">
                                                    {deadline.fromNow()}&nbsp;
                                                    <small>({deadline.format('YYYY-MM-DD HH:mm')})</small>
                                                  </span>
                                                </div>
                                            </div>
                                        </div>
                                      </div>

                                </div>
                                <div className="col-md-3">
                                    <div className="btn-group-vertical btn-block" role="group">
                                        <button className="btn btn-default"><i style={{marginTop: '3px'}} className="pull-left fa fa-retweet"></i> Ask for reassignment</button>
                                        <button className="btn btn-default"><i style={{marginTop: '3px'}} className="pull-left fa fa-question"></i> Ask for clarification</button>
                                    </div>
                                </div>
                                     <div className="col-md-12">
                                            <div className="form-group">
                                                <div className="input-group">
                                                  <span className="input-group-addon"><strong>Description</strong></span>
                                                  <span style={{float: 'none'}} className="form-control">
                                                    {this.state.task.parent.description}
                                                  </span>
                                                </div>
                                            </div>
                                        </div>
                            </div>
                            <hr style={{marginTop:0}} />
                            <div className="row">
                                <div className="col-md-9"></div>
                                <div className="col-md-3">
                                        <button className="btn btn-primary btn-block btn-default">
                                            <i style={{marginTop: '3px'}} className="pull-left fa fa-floppy-o"></i> Save Answer
                                        </button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <DetailRender />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

