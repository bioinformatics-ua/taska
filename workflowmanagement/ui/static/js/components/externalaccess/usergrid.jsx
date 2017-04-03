'use strict';
import Reflux from 'reflux';
import React from 'react';
import Griddle from 'griddle-react';

import UserStore from '../../stores/UserStore.jsx';
import UserGridStore from '../../stores/UserGridStore.jsx';

import StateActions from '../../actions/StateActions.jsx';
import UserGridActions from '../../actions/UserGridActions.jsx';

import {TableComponentMixin} from '../../mixins/component.jsx';
import {LayeredComponentMixin} from '../../mixins/component.jsx';

const RemoveButton = React.createClass({
    remove(){
        this.props.metadata.removeUser(this.props.rowData);
    },
    render: function () {
        return <span>
            <button type="button" onClick={this.remove} className="btn btn-xs btn-link"
                    data-dismiss="modal"><i className="fa fa-times-circle"></i></button>
            </span>;
    }

});

const Modal = React.createClass({
    getDefaultProps(){
        return {
            title: 'Undefined Title',
            showConfirm: true,
            visible: true,
            overflow: 'auto',
            modalbody: '',
            modalfooter: undefined
        }
    },
    setFirstName(e){
        this.props.onChange(e.target.value);
    },
    render(){
        if (this.props.visible)
            return <div className="modal modalback show">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" onClick={this.props.close} className="close" data-dismiss="modal"
                                    aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 className="modal-title">{this.props.title}</h4>
                        </div>

                        <div style={{overflow: this.props.overflow}} className="modal-body">
                            <span> <br/><br/>
                                {this.props.modalbody}
                            </span>
                        </div>

                        {this.props.modalfooter != undefined ?
                            <div className="modal-footer">
                                {this.props.modalfooter}
                            </div> : ''}
                    </div>
                </div>
            </div>;
        return undefined;
    }
});

const AddButton = React.createClass({
    mixins: [LayeredComponentMixin],
    getDefaultProps(){
        return {
            showmodal: false
        }
    },
    success(e){
        this.props.success();
        this.setState({clicked: false});
    },
    render: function () {
        return <button style={this.props.extraStyle} className={`btn ${this.props.extraCss}`}
                       onClick={this.props.showmodal ? this.handleClick : this.success}>
            <i className={this.props.icon}></i>{this.props.label}</button>;
    },
    getModalBody(){
        return this.props.getModalBody();
    },
    getModalFooter(){
        return <div>
            <button type="button" onClick={this.handleClose} className="btn btn-default"
                    data-dismiss="modal">{'Cancel'}</button>
            <button type="button" onClick={this.success} className="btn btn-primary">{'Ok'}</button>
        </div>;
    },
    renderLayer: function () {
        if (this.state.clicked && this.props.showmodal) {
            if (UserStore.isEmail(this.props.new_user)) {
                return <Modal title={this.props.title}
                              success={this.success}
                              modalbody={this.getModalBody()}
                              modalfooter={this.getModalFooter()}
                              close={this.handleClose}
                              {...this.props}/>;
            }
            else {
                StateActions.alert({
                    'title': "Email must be a valid email",
                    'message': "The email must follow a pattern like <user>@<domain>"
                });
            }
            this.setState({clicked: false});
        }
        return <span />;
    },
    handleClose: function () {
        this.setState({clicked: false});
    },
    handleClick: function () {
        this.setState({clicked: !this.state.clicked});
    },
    getInitialState: function () {
        return {clicked: false};
    }
});


const ExternalUserTable = React.createClass({
    tableAction: UserGridActions.load,
    tableStore: UserGridStore,
    mixins: [Reflux.listenTo(UserGridStore, 'update'), TableComponentMixin],
    componentWillMount(){
        UserGridActions.calibrate();
    },
    getInitialState: function () {
        return {
            new_user: "",
            new_firstname: "",
            new_lastname: "",
        };
    },
    update: function (data) {
        this.setState(this.getState());
        this.props.setUsers(this.state.entries);
    },
    addNewUserToState(e){
        this.setState({new_user: e.target.value});
    },
    setFirstName(e){
        this.setState({new_firstname: e.target.value});
    },
    setLastName(e){
        this.setState({new_lastname: e.target.value});
    },
    addNewUser(){
        let new_user = {
            "email": this.state.new_user,
            "firstName": this.state.new_firstname,
            "lastName": this.state.new_lastname,
            "exists": true
        };
        let new_entries = this.state.entries;
        new_entries.push(new_user);
        this.setState({
            entries: new_entries,
            new_user: "",
            new_firstname: "",
            new_lastname: "",
        });
        this.props.setUsers(new_entries);
    },
    removeUser(user){
        let new_entries = [];
        for(var index = 0;  index < this.state.entries.length; index++)
            if(this.state.entries[index].email != user.email)
                new_entries.push(this.state.entries[index]);

        this.setState({entries: new_entries});
        this.props.setUsers(new_entries);
    },
    getModalBody(){
        return <span>
            <p>You can add more information about the user (Optional)</p>
            <br />
            <textarea rows="1"
                      placeholder="First name"
                      className="form-control"
                      onChange={this.setFirstName}
                      defaultValue={this.state.new_firstname}/>
            <br />
            <textarea rows="1"
                      placeholder="Last name"
                      className="form-control"
                      onChange={this.setLastName}
                      defaultValue={this.state.new_lastname}/>
        </span>;
    },
    render() {
        const columnMeta = [
            {
                "columnName": "firstName",
                "order": 1,
                "locked": false,
                "visible": true,
                //"customComponent": ProcessLink,
                //"cssClassName": "mystudies-process-title-td",
                "displayName": "First name"
            },
            {
                "columnName": "lastName",
                "order": 2,
                "locked": false,
                "visible": true,
                //"customComponent": ProcessLink,
                //"cssClassName": "mystudies-process-title-td",
                "displayName": "Last name"
            },
            {
                "columnName": "email",
                "order": 3,
                "locked": false,
                "visible": true,
                //"customComponent": ProcessLink,
                //"cssClassName": "mystudies-process-title-td",
                "displayName": "Email"
            },
            {
                "columnName": "remove",
                "order": 4,
                "locked": false,
                "visible": true,
                "removeUser": this.removeUser,
                "customComponent": RemoveButton,
                //"cssClassName": "mystudies-process-title-td",
                "displayName": ""
            },
        ];
        return <span>
            <div className="form-group">
                <div className="input-group">
                    <span className="input-group-addon" id="startdate">
                        <strong>Email</strong>
                    </span>
                    <input className="form-control" placeholder="" onChange={this.addNewUserToState}
                           value={this.state.new_user}/>
                    <span className="input-group-btn">
                        <AddButton
                            success={this.addNewUser}
                            label={""}
                            extraCss={"btn btn-success"}
                            title={"User information"}
                            onChange={this.addNewUserToState}
                            icon={"fa fa-plus"}
                            showmodal={true}
                            new_user={this.state.new_user}
                            getModalBody={this.getModalBody}/>
                    </span>
                </div>
            </div>
            <div className="panel panel-default panel-overflow griddle-pad">
                <div className="panel-heading">
                    <i className="fa fa-users pull-left"></i>
                    <h3 className="text-center panel-title"> Users</h3>
                </div>
                <Griddle
                    noDataMessage={<center>You don't have user to select.</center>}
                    {...this.commonTableSettings(false)}
                    columns={["firstName", "lastName", "email", "remove"]}
                    columnMetadata={columnMeta}/>
            </div>
        </span>;
    }
});

export default {ExternalUserTable};