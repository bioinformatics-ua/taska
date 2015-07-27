'use strict';
import Router from 'react-router';
import React from 'react/addons';
import Reflux from 'reflux';

import {Authentication} from '../mixins/component.jsx';

import Select from 'react-select';

import UserStore from '../stores/UserStore.jsx';

import UserActions from '../actions/UserActions.jsx';

import Toggle from 'react-toggle';

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
    update(changed_password){
        if(changed_password){
            this.context.router.transitionTo('login');
        };

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
    setPassword(e){
        UserActions.setField('password', e.target.value);
    },
    setConfirmPassword(e){
        UserActions.setField('confirm_password', e.target.value);
    },
    setDetailMode(e){
        let n = Number.parseInt(e)

        if(isNaN(n))
            n = '';
        UserActions.setProfileField('detail_mode', n);
    },
    setNotification(e){
        UserActions.setProfileField('notification', e.target.checked);
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
                                <input className="form-control" onChange={this.setFirst} defaultValue={this.state.user['first_name']} />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="startdate">
                                    <strong>Last Name</strong>
                                </span>
                                <input className="form-control" onChange={this.setLast} defaultValue={this.state.user['last_name']} />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="startdate">
                                    <strong>New Password</strong>
                                </span>
                                <input className="form-control" placeholder="Only fill when changing password" type="password" onChange={this.setPassword} defaultValue={this.state.user['password']} />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="startdate">
                                    <strong>Confirm Password</strong>
                                </span>
                                <input className="form-control" placeholder="Only fill when changing password" type="password" onChange={this.setConfirmPassword} defaultValue={this.state.user['confirm_password']} />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="detailmode">
                                    <strong>Detail Render</strong>
                                </span>
                                <Select placeholder="Select a Detail Render Mode" onChange={this.setDetailMode}
                                    value={''+this.state.user.profile['detail_mode']} searchable={false}
                                    options={[  {value: '0', label: 'Appear in Popup (good for low resolutions in desktop)'},
                                                {value: '1', label: 'Appear Below diagram (good for mobile platforms)'},
                                                {value: '2', label: 'Appear on the Left Bar (good for high resolutions)'},
                                                ]} />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="startdate">
                                    <strong>Email Notifications</strong>
                                </span>
                                <div className="form-control">
                                    <span className="selectBox">
                                        <Toggle key={`ptoggle_${this.state.user.profile.notification}`}
                                            defaultChecked={this.state.user.profile.notification}
                                            onChange={this.setNotification}/>
                                    </span>
                                </div>
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
