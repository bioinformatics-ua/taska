'use strict';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Modal} from './reusable/component.jsx';
import Reminders from './reusable/Reminders.jsx'
import PermissionsBar from './process/PermissionsBar.jsx';
import UserTable from './reusable/usergrid.jsx';
import StateActions from '../actions/StateActions.jsx';
import UserActions from '../actions/UserActions.jsx';

export default React.createClass({
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    __getState(){
        return {
            message: "",
            users: [],
            reminders: {
                before: "",
                after: "",
                repeatUpTo: null
            }
        }
    },
    getInitialState(){
        return this.__getState();
    },
    getWorkflow(){
        let detail = Object.keys(this.props.detail)[0];
        return this.props.detail[detail];
    },
    setUsers(list){
        this.setState({users: list});
    },
    setReminders(reminders){
        this.setState({reminders: reminders});
    },
    setMessage(e){
        this.setState({message: e.target.value});
    },
    goToStudySetup(){
        //Do validations
        if (this.state.users.length == 0) {
            StateActions.alert({
                'title': "No users selected",
                'message': "Add some users to participate in the study before heading to next step."
            });
        }
        else if((this.state.reminders.after != 0 && this.state.reminders.repeatUpTo == null) || (this.state.reminders.after == 0 && this.state.reminders.repeatUpTo != null)){
            StateActions.alert({
                'title': "Reminders were selected incorrectly",
                'message': "To set up a reminder after deadline you need to fill both fields"
            });
        }
        else{
            this.props.setMessage(this.state.message);
            this.props.setRemindersConfig(this.state.reminders);
            UserActions.invite(this.state.users, this.props.setFilteredUsers, this.props.transitToWorkflowRun);
        }
    },
    render(){
        let params = this.context.router.getCurrentParams();
        return <span><div className="status-detail">
                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group">
                            <div className="input-group">
                              <span className="input-group-addon"
                                    id="study-title"><strong>Title</strong></span>
                              <input type="title" className="form-control"
                                     id="exampleInputEmail1" aria-describedby="study-title"
                                     defaultValue={this.getWorkflow().title}
                                     disabled={true}/>
                            </div>
                        </div>
                    </div>
                </div>
                <PermissionsBar
                    link="WorkflowEdit"
                    owner={this.props.workflow['owner_repr']}
                    forkable={false}
                    editable={false}
                    runnable={false}
                    showEdit={false}
                    showRun={false}
                    object={params.object}
                    title={this.getWorkflow().title}
                    listProcesses={this.props.workflow['assoc_processes']}
                    {...this.props.workflow.permissions}/>
                <hr />

                <div className="row">
                    <div className="col-md-6">
                        <UserTable hash={""} setUsers={this.setUsers}/>
                    </div>
                    <div className="col-md-6">
                        <div className="row">
                            {/*<div>
                                <p>You can write a small introduction to help users to understand the purpose of the study.</p>
                            </div>
                            <textarea onChange={this.setMessage} rows="7"
                                  className="form-control" value={this.state.message}
                                  placeholder="Write a study introduction there (Optional)"/>
                            <br />*/}
                        </div>
                        <Reminders setReminders={this.setReminders}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <button style={{marginTop: '3px'}} type="button" onClick={this.goToStudySetup} className="btn btn-primary btn-default pull-right ">
                                                <i style={{marginTop: '3px'}} className="pull-left fa fa-arrow-right"></i> Next Step</button>
                    </div>
                </div>
        </div></span>;
    }
});
