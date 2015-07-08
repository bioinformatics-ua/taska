'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import {Modal, PermissionsBar, ProcessStatus, DeleteButton} from './reusable/component.jsx';

import WorkflowActions from '../actions/WorkflowActions.jsx';

import ProcessActions from '../actions/ProcessActions.jsx';

import UserStore from '../stores/UserStore.jsx';

import WorkflowStore from '../stores/WorkflowStore.jsx';

import ProcessStore from '../stores/ProcessStore.jsx';

import {StateMachineComponent} from '../react-statemachine/component.jsx';

import {StateMachine, SimpleState} from '../react-statemachine/classes.jsx';

import {SimpleTask, SimpleTaskRun} from './reusable/states/SimpleTask.jsx';

import {ProcessResume} from './ProcessResume.jsx';

const ProcessLabel = React.createClass({
    render(){
        return <table className="process-label">
                    <tr>
                        <td><div className="circle circle-sm circle-default"></div></td>
                        <td><small>&nbsp;Waiting&nbsp;&nbsp;</small></td>
                        <td><div className="circle circle-sm circle-primary"></div></td>
                        <td><small>&nbsp;Running&nbsp;&nbsp;</small></td>
                        <td><div className="circle circle-sm circle-success"></div></td>
                        <td><small>&nbsp;Finished&nbsp;&nbsp;</small></td>
                        <td><div className="circle circle-sm circle-warning"></div></td>
                        <td><small>&nbsp;Overdue&nbsp;&nbsp;</small></td>
                        <td><div className="circle circle-sm"></div></td>
                        <td><small>&nbsp;Canceled&nbsp;&nbsp;</small></td>
                    </tr>
                </table>
    }
});
var i = 0;
export default React.createClass({
    mixins: [   Router.Navigation,
                Authentication,
                Reflux.listenTo(ProcessStore, 'update')],
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
    displayName: route => {
        try {
            let process = route.props.detail.Process.process;
            return `Process - ${process['object_repr']} (${process['start_date']})`;
        } catch(ex){
            return "Process Not Found";
        }
    },
    __getState(){
        return {
            process: ProcessStore.getDetail(),
            ***REMOVED*** WorkflowStore.getDetail(),
            workflowrepr: ProcessStore.getRepr(),
            missing: ProcessStore.getMissing(),
            version: ProcessStore.getVersion(),
            user: UserStore.getUser()
        }
    },
    getInitialState(){
        return this.__getState();
    },
    componentWillMount(){
        ProcessActions.calibrate();
    },
    update(status){
        if(status === ProcessStore.DETAIL){
            this.setState(this.__getState());
        }
    },
    load(){

    },
    closePopup(){
        ProcessActions.calibrate();
    },
    save(){

    },
    cancel(){
        ProcessActions.cancel();
    },
    cancelUser(task, user, val){
        console.log(`CANCEL USER ${user} on process task ${task}`);
        ProcessActions.cancelUser(task, user, val);
    },
    addNew(task, user){
        console.log(`ADD USER ${user} on process task ${task}`);
        ProcessActions.addUser(task, user);
    },
    render() {
        if(this.props.failed){
            let Failed = this.props.failed;
            return <Failed />;
        }
        i++;
        console.log('RENDER PROCESS ');
        let params = this.context.router.getCurrentParams();

        if(params.mode && !(params.mode === 'edit' || params.mode === 'view'))
            this.context.router.replaceWith('/404');

        let [sm, checksum] = this.state.workflowrepr;

        return (
            <span>
                <StateMachineComponent key={'process'+params.mode+checksum}
                    extra={
                        <span>
                            <PermissionsBar
                                link="ProcessEdit"
                                owner={this.state.workflow['owner_repr']}
                                editable={params.mode === 'edit'}
                                showEdit={false}
                                runnable={params.mode === 'run'}
                                extra={this.state.process.status === 1 || this.state.process.status === 4?
                                    <DeleteButton
                                      success={this.cancel}
                                      identificator = {false}
                                      deleteLabel= {<span><i className="fa fa-ban" /> Cancel</span>}
                                      title={`Cancel ${this.state.process['object_repr']}`}
                                      message={`Are you sure you want to cancel  ${this.state.process['object_repr']} ?`}  />
                                      : ''
                                }
                                showRun={false}
                                object={params.object}
                                {...this.state.workflow.permissions} />
                            <div className="row">
                                <div className="col-md-5">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <span className="input-group-addon" id="startdate">
                                                <strong>Start Date</strong>
                                            </span>
                                            <input className="form-control" readOnly value={this.state.process['start_date']} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-5">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <span className="input-group-addon" id="enddate">
                                                <strong>End Date</strong>
                                            </span>
                                            <input className="form-control" readOnly value={this.state.process['end_date'] || '---'} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <ProcessStatus label="True" rowData={{status: this.state.process.status}} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{backgroundColor: '#CFCFCF', width: '100%', height: '10px'}}>
                            <div title={`${this.state.process.progress}% completed`} style={{backgroundColor: '#19AB27', width: `${this.state.process.progress}%`, height: '10px'}}></div>
                            &nbsp;</div>
                            <ProcessLabel />
                        </span>
                    }
                    title={this.state.workflow.title}
                    editable={params.mode === 'edit'}
                    save={this.save}
                    saveLabel={<span><i className="fa fa-floppy-o"></i> &nbsp;Save Process</span>}
                    initialSm={sm}
                    savebar={!params.mode || params.mode === 'view'? false: true}
                    addNew={this.addNew}
                    cancelUser={this.cancelUser}
                    endDetail={ProcessResume}
                    detailMode={this.state.user.profile['detail_mode']}

                    selectFirst={true}

                    {...this.props}/>
            </span>
        );
    }
});

