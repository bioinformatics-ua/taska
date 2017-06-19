'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';
import moment from 'moment';

import {Authentication} from '../mixins/component.jsx';

import {Modal, ProcessStatus, DeleteButton, RunButton, ProcessLabel} from './reusable/component.jsx';
import ProcessDetailBar from './process/ProcessDetailBar.jsx';
import PermissionsBar from './process/PermissionsBar.jsx';

import WorkflowActions from '../actions/WorkflowActions.jsx';

import ProcessActions from '../actions/ProcessActions.jsx';

import UserStore from '../stores/UserStore.jsx';

import WorkflowStore from '../stores/WorkflowStore.jsx';

import ProcessStore from '../stores/ProcessStore.jsx';

import {StateMachineComponent} from '../react-statemachine/component.jsx';

import {StateMachine, SimpleState} from '../react-statemachine/classes.jsx';

import {SimpleTask, SimpleTaskRun} from './reusable/states/SimpleTask.jsx';

import {ProcessResume} from './ProcessResume.jsx';


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
            return `Process - ${process['title'] || process['object_repr']} (${process['start_date']})`;
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
    runProcess(){
        //Call function to change process state and tasks state
        ProcessActions.startProcess(this.state.process['hash']);
    },
    getValidation(){
        return ProcessStore.getValidation(this.state.process['hash']);
    },
    cancelUser(task, user, val, cancelTask){
        console.log(`CANCEL USER ${user} on process task ${task}`);
        ProcessActions.cancelUser(task, user, val, cancelTask);
    },
    cancelTask(task){
        console.log(`CANCEL process task ${task}`);
        ProcessActions.cancelTask(task);
    },
    reassignRejectedUser(hash, oldUser, newUser, all){
        ProcessActions.reassignRejectedUser(hash, oldUser, newUser, all);
    },
    addNew(task, user){
        console.log(`ADD USER ${user} on process task ${task}`);
        ProcessActions.addUser(task, user);
    },
    refineAnswer(ptu){
        console.log(`Refine process task user ${ptu}`);
        ProcessActions.refineAnswer(ptu);
    },
    render() {
        if(this.props.failed){
            let Failed = this.props.failed;
            return <Failed />;
        }
        i++;
        console.log('RENDER PROCESS ');

        let params = this.context.router.getCurrentParams();

        if(params.mode && !(params.mode === 'edit' || params.mode === 'view' || params.mode === 'showOnly'))
            this.context.router.replaceWith('/404');

        let [sm, checksum] = this.state.workflowrepr;
        return (
            <span>
                <StateMachineComponent key={'process'+params.mode+checksum}
                    extra={
                        <span>
                        {params.mode && !(params.mode === 'edit' || params.mode === 'view') ? '':
                            <PermissionsBar
                                link="ProcessEdit"
                                owner={this.state.workflow['owner_repr']}
                                editable={params.mode === 'edit'}
                                showEdit={false}
                                runnable={params.mode === 'run'}
                                extra={this.state.process.status === 1 || this.state.process.status === 4 ?
                                    <DeleteButton
                                      success={this.cancel}
                                      identificator = {false}
                                      deleteLabel= {<span><i className="fa fa-ban" /> Cancel</span>}
                                      title={`Cancel ${this.state.process['object_repr']}`}
                                      message={`Are you sure you want to cancel the study ${this.state.process['object_repr']} ?`}  />
                                      : this.state.process.status === 5 ?
                                    <div className="btn-group" role="group">
                                        <DeleteButton
                                          success={this.cancel}
                                          identificator = {false}
                                          deleteLabel= {<span><i className="fa fa-ban" /> Cancel</span>}
                                          title={`Cancel ${this.state.process['object_repr']}`}
                                          message={`Are you sure you want to cancel  ${this.state.process['object_repr']} ?`}  />
                                        <RunButton
                                          success={this.runProcess}
                                          getValidation={this.getValidation}
                                          hash={this.state.process['hash']}
                                          identificator = {false}
                                          runLabel= {<span><i className="fa fa-play"></i> Run</span>}
                                          title={`Run ${this.state.process['object_repr']}`}
                                          message={`Some of the users have not confirmed their availability! Are you sure you want to run  ${this.state.process['object_repr']} ?`}  />
                                    </div>
                                      :''
                                }
                                showRun={false}
                                object={params.object}
                                {...this.state.workflow.permissions} />}

                            <ProcessDetailBar
                                active={true}
                                disabled={true}
                                toggleDisabled={true}
                                numDaysBefore={this.state.process['days_before_delay']}
                                numDaysAfter={this.state.process['days_after_delay']}
                                defaultDate={moment(this.state.process['send_notification_until']).toDate()}
                                
                                startDate={this.state.process['start_date']}
                                endDate={this.state.process['end_date'] || '---'}
                                status={this.state.process.status}
                                progress={this.state.process.progress}/>
                            
                            <ProcessLabel
                                links={params.mode === 'showOnly' ? '':
                                    <span>
                                        <small>
                                            <Link to="StatusDetail" params={{object: params.object}}>
                                                <i className="fa fa-users"></i> Show assignees &nbsp;
                                            </Link>
                                        </small>
                                        <small>
                                            <Link to="StudyRequests" params={{object: params.object}}>
                                                <i className="fa fa-question"></i> Show requests &nbsp;
                                            </Link>
                                        </small>
                                        <small>
                                            <Link to="MessageSender" params={{hash: params.object, object: 'process'}}>
                                                 <i className="fa fa-envelope"></i> Messages
                                            </Link>
                                        </small>
                                    </span>}
                            />

                        </span>
                    }
                    title={this.state.process.title || this.state.workflow.title}
                    editable={params.mode === 'edit'}
                    save={this.save}
                    saveLabel={<span><i className="fa fa-floppy-o"></i> &nbsp;Save Process</span>}
                    initialSm={sm}
                    savebar={!params.mode || params.mode === 'view' || params.mode === 'showOnly' ? false: true}
                    addNew={this.addNew}
                    reassignRejectedUser={this.reassignRejectedUser}
                    refineAnswer={this.refineAnswer}
                    cancelUser={this.cancelUser}
                    cancelTask={this.cancelTask}
                    endDetail={ProcessResume}
                    detailMode={this.state.user.profile['detail_mode']}
                    showOnly={params.mode === 'showOnly'}

                    selectFirst={true}

                    {...this.props}/>
            </span>
        );
    }
});

