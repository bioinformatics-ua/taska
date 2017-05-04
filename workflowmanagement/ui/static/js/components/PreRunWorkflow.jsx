'use strict';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Modal, PermissionsBar, ProcessDetailBar} from './reusable/component.jsx';
import {UserTable} from './reusable/usergrid.jsx';
import StateActions from '../actions/StateActions.jsx';
import UserActions from '../actions/UserActions.jsx';

export default React.createClass({
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    __getState(){
        return {
            message: "",
            users: []
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
        this.setState({users: []});
        this.setState({users: list});
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
        else {
            this.props.setMessage(this.state.message);
            UserActions.invite(this.state.users, this.props.setFilteredUsers, this.props.transitToWorkflowRun);
        }
    },
    render(){
        let params = this.context.router.getCurrentParams();
        return <span><div>
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
                    <div className="col-md-12">
                        <UserTable hash={""} setUsers={this.setUsers}/>
                    </div>
                    {/*<div className="col-md-6">

                        <textarea onChange={this.setMessage} rows="7"
                              className="form-control" value={this.state.message}
                              placeholder="Write a study introduction there (Optional)"/>

                    </div>*/}
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
