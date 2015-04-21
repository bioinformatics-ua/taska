'use strict';
import Router from 'react-router';
import React from 'react/addons';
import Reflux from 'reflux';

import {Authentication} from '../mixins/component.jsx';

import Select from 'react-select';

import UserStore from '../stores/UserStore.jsx';

import UserActions from '../actions/UserActions.jsx';

export default React.createClass({
    displayName: "Profile",
    mixins: [Router.Navigation, Authentication,
                Reflux.listenTo(UserStore, 'update')],
    getState(){
        return {
            user: UserStore.getUser(),
        }
    },
    getInitialState(){
        return this.getState();
    },
    update(){
        this.setState(this.getState());
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    setFirst(e){
        UserActions.setField('first_name', e.target.value);
    },
    setLast(e){
        UserActions.setField('last_name', e.target.value);
    },
    save(e){
        UserActions.saveUser()
    },
    render: function () {
        return (
            <span>
                <div className="row">
                    <div className="profileform col-md-8 col-md-offset-2">
                        <h3>Edit Profile</h3>
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="startdate">
                                    <strong>Email</strong>
                                </span>
                                <input className="form-control" disabled value={this.state.user.email} />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="startdate">
                                    <strong>First Name</strong>
                                </span>
                                <input className="form-control" onChange={this.setFirst} value={this.state.user['first_name']} />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="startdate">
                                    <strong>Last Name</strong>
                                </span>
                                <input className="form-control" onChange={this.setLast} value={this.state.user['last_name']} />
                            </div>
                        </div>
                        {/*<div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="startdate">
                                    <strong>Country</strong>
                                </span>
                                <Select placeholder="Search for Country" onChange={this.newAssignee}
                                    value={''} name="country"
                                 options={[]} />
                            </div>
                        </div>*/}
                        <button onClick={this.save} className="pull-right btn btn-primary">
                            <i className="fa fa-floppy-o"></i> &nbsp;Save
                        </button>
                    </div>
                </div>
            </span>);
    }
});
