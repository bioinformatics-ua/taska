'use strict';
import Router from 'react-router';
import React from 'react/addons';
import Reflux from 'reflux';

import Select from 'react-select';

import UserStore from '../stores/UserStore.jsx';

import UserActions from '../actions/UserActions.jsx';
import StateActions from '../actions/StateActions.jsx';

import Toggle from 'react-toggle';

export default React.createClass({
    displayName: "Register",
    mixins: [Router.Navigation,
                Reflux.listenTo(UserStore, 'update')],
    statics: {
        fetch(params) {
            return new Promise(function (fulfill, reject){
                UserStore.init();
                fulfill({});
            });
        }
    },
    getState(){
        return {
            user: UserStore.getUser(),
            registered: UserStore.hasRegistered()
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
    setEmail(e){
        UserActions.setField('email', e.target.value);
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
    register(e){
        e.preventDefault();

        UserActions.registerUser()
    },
    componentDidUpdate(){
        if(this.state.registered==true){
            this.context.router.transitionTo('default');
            StateActions.alert({
                'title': 'User registered with success',
                'message': 'The user has been registered successfully, and the decision about approval will be briefly communicated by email by the administrators.'
            })
        }
    },
    render: function () {
        return (
            <span>
                <form onSubmit={this.register}>
                <div className="row">
                    <div className="profileform col-md-8 col-md-offset-2">
                        <h3>Register Account</h3>
                        <p>To register, please apply with the form below.</p>
                        <p>At this time, registry is manually approved by the administrator. You will receive an email with the veredict of your approval status.</p>
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="startdate">
                                    <strong>Email</strong>
                                </span>
                                <input className="form-control" onChange={this.setEmail} defaultValue={this.state.user.email} />
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
                                    <strong>Password</strong>
                                </span>
                                <input className="form-control" placeholder="" type="password" onChange={this.setPassword} defaultValue={this.state.user['password']} />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="startdate">
                                    <strong>Confirm Password</strong>
                                </span>
                                <input className="form-control" placeholder="" type="password" onChange={this.setConfirmPassword} defaultValue={this.state.user['confirm_password']} />
                            </div>
                        </div>
                        {/*<div className="form-group">
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
                                            checked={this.state.user.profile.notification}
                                            defaultChecked={this.state.user.profile.notification}
                                            onChange={this.setNotification}/>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="startdate">
                                    <strong>Country</strong>
                                </span>
                                <Select placeholder="Search for Country" onChange={this.newAssignee}
                                    value={''} name="country"
                                 options={[]} />
                            </div>
                        </div>*/}
                        <button type="submit" className="pull-right btn btn-primary">
                            <i className="fa fa-floppy-o"></i> &nbsp;Register
                        </button>
                    </div>
                </div>
                </form>
            </span>);
    }
});
