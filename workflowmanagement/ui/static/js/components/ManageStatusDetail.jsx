'use strict';
import Router from 'react-router';
import {Link} from 'react-router';
import React from 'react/addons';
import Reflux from 'reflux';

import {StatusDetailTable} from './reusable/statusdetail.jsx';
import {ReassigningButton, ProcessLabel, ProcessDetailBar, PermissionsBar} from './reusable/component.jsx';

import ProcessStore from '../stores/ProcessStore.jsx';
import WorkflowStore from '../stores/WorkflowStore.jsx';

import WorkflowActions from '../actions/WorkflowActions.jsx';
import ProcessActions from '../actions/ProcessActions.jsx';
import UserActions from '../actions/UserActions.jsx';
import StatusDetailActions from '../actions/StatusDetailActions.jsx';

import moment from 'moment';

import {Authentication} from '../mixins/component.jsx';
import Select from 'react-select';

export default React.createClass({
    displayName: "",
    mixins: [Authentication,
        Reflux.listenTo(ProcessStore, 'update')],
    statics: {
        fetch(params) {
            return new Promise(function (fulfill, reject) {

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
    getState(){
        return {
            process: ProcessStore.getDetail(),
            ***REMOVED*** WorkflowStore.getDetail(),
            showReassign: false,
            users: [],
            new_reassigning: undefined,
            oldUser: undefined,
            ptuhash: undefined,
            tempAlreadyUsers: [],
        }
    },
    getInitialState(){
        return this.getState();
    },
    componentWillMount(){
        UserActions.loadSimpleListIfNecessary.triggerPromise().then(
            (users) => {
                let map = users.results.map(
                    entry => {
                        return {
                            value: '' + entry.id,
                            label: entry.fullname
                        }
                    }
                );
                if (this.isMounted()) {
                    this.setState(
                        {
                            users: map
                        }
                    );
                }
            }
        );

    },
    showReassignSelect(e) {
        let alreadyusers = [];
        let pthash = $(e.target).data('pthash');
        let selectedUser = Number.parseInt($(e.target).data('assignee'));

        //add all in already user except the selected and verify if the selected user was rejected the task, if no add too
        for (var i = 0; i < this.state.process.tasks.length; i++)
            if (this.state.process.tasks[i].task === pthash)
                for (var j = 0; j < this.state.process.tasks[i].users.length; j++)
                    if ((this.state.process.tasks[i].users[j].user != selectedUser) ||
                        (this.state.process.tasks[i].users[j].user == selectedUser && this.state.process.tasks[i].users[j].status != 3))
                        alreadyusers += [this.state.process.tasks[i].users[j].user];

        this.setState({
            showReassign: true,
            oldUser: Number.parseInt($(e.target).data('assignee')),
            ptuhash: $(e.target).data('ptuhash'),
            tempAlreadyUsers: alreadyusers,
        });
    },
    newReassigning(e){
        this.setState({new_reassigning: e});
    },
    reloadProcess(){
        ProcessActions.loadDetailIfNecessary.triggerPromise(this.state.process.hash).then(
            (Process) => {
                this.setState({process: Process});

            }
        ).catch(ex=>reject(ex));
    },
    reassign(){
        StatusDetailActions.reassignRejectedUser(this.state.process.hash, this.state.ptuhash, this.state.oldUser, this.state.new_reassigning, false);
        this.setState({showReassign: false, new_reassigning: undefined});
        this.reloadProcess();
    },
    reassignAll(){
        StatusDetailActions.reassignRejectedUser(this.state.process.hash, this.state.ptuhash, this.state.oldUser, this.state.new_reassigning, true);
        this.setState({showReassign: false, new_reassigning: undefined});
        this.reloadProcess();
    },
    render() {
        let params = this.context.router.getCurrentParams();

        return (<div className="status-detail">
            <div>
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
                    links={<span>
                                <small>
                                        <Link to="StudyRequests" params={{object: params.object}}>
                                            <i className="fa fa-question"></i> Show requests &nbsp;
                                        </Link>
                                </small>
                                <small>
                                    <Link to="MessageSender" params={{hash: params.object, object: 'process'}}>
                                        <i className="fa fa-envelope"></i> Send message
                                    </Link>
                                </small>
                            </span>}/>
                <hr />

                <div className="panel panel-default panel-overflow  griddle-pad">
                    <div className="panel-heading">
                        <i className="fa fa-tasks pull-left"></i>
                        <h3 style={{position: 'absolute', width: '95%'}} className="text-center panel-title">Assignee
                            Status</h3>
                    </div>
                    <div className="panel-body tasktab-container">
                        <StatusDetailTable hash={params.object} showReassign={this.showReassignSelect}/>
                    </div>
                </div>
            </div>
            {this.state.showReassign ?
                <div>
                    <hr />
                    <div className="input-group reassign">
                        <Select placeholder="Search for users to reassigning" onChange={this.newReassigning}
                                value={this.state.new_reassigning} name="form-field-name"
                                options={this.state.users.filter(user => (this.state.tempAlreadyUsers.indexOf(user.value) === -1))}/>
                                      <span className="input-group-btn">
                                        <ReassigningButton
                                            success={this.reassign}
                                            allTasks={this.reassignAll}
                                            identificator={false}
                                            runLabel={<span><i className="fa fa-plus"></i></span>}
                                            title={'Reassigning'}
                                            message={'You can reassign only this task or all tasks that this user are envolved!'}/>
                                      </span>
                    </div>
                </div> : ''}
        </div>);
    }
});