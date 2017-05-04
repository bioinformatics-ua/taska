'use strict';
import Reflux from 'reflux';
import React from 'react';
import Griddle from 'griddle-react';
import Select from 'react-select';

import UserStore from '../../stores/UserStore.jsx';
import UserGridStore from '../../stores/UserGridStore.jsx';

import StateActions from '../../actions/StateActions.jsx';
import UserGridActions from '../../actions/UserGridActions.jsx';
import UserActions from '../../actions/UserActions.jsx';

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
       // if (UserStore.isEmail(this.props.new_user)) {
            this.props.success();
            this.setState({clicked: false});
        /*}
        else {
            StateActions.alert({
                'title': "Email must be a valid email",
                'message': "The email must follow a pattern like <user>@<domain>"
            });
        }*/

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
            return <Modal title={this.props.title}
                              success={this.success}
                              modalbody={this.getModalBody()}
                              modalfooter={this.getModalFooter()}
                              close={this.handleClose}
                              {...this.props}/>;
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


const UserTable = React.createClass({
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
            selectedUsers: [],
            users: [],
            allUser: [], //Refactor THIS
        };
    },
    componentWillMount(){
        if (this.state.users.length == 0)
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
                                users: map,
                                allUser: users
                            }
                        );
                    }
                }
            );
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
    getUserInformation(id){//Refactor this. Remove this method and prepare the service to read ids too
        let all = this.state.allUser.results;
        for(var i = 0; i < all.length; i += 1)
            if(all[i].id == id) //Look for the users info, this is stupid come on john. you can be better than this.
                return {
                        "email": all[i].email,
                        "firstName": all[i].first_name,
                        "lastName": all[i].last_name,
                        "exists": true//Why true?? Remember why and fix
                        };

        return undefined;
    },
    addUsersToTable(){
        if(this.state.selectedUsers.length > 0){
            let new_entries = this.state.entries;
            let selectedUsers = this.state.selectedUsers.split(',');

            //Prepare the users to be added
            for(var i = 0; i < selectedUsers.length; i += 1)
            {
                let tmp_user = this.getUserInformation(selectedUsers[i]);
                new_entries.push(tmp_user);
            }

            //Remove selected users from available users
            let filterUsers = this.state.users;
            filterUsers = filterUsers.filter(user => (selectedUsers.indexOf(user.value) === -1));

            this.setState({
                entries: new_entries,
                users: filterUsers,
                selectedUsers: []
            });
            this.props.setUsers(new_entries);
        }
    },
    removeUser(user){
        let new_entries = [];
        for(var index = 0;  index < this.state.entries.length; index++)
            if(this.state.entries[index].email != user.email)
                new_entries.push(this.state.entries[index]);

        let availableUsers = this.state.users;

        let all = this.state.allUser.results;
        let removedUser;
        for (var i = 0; i < all.length; i += 1)
            if (all[i].email == user.email)
                removedUser = {
                    value: '' + all[i].id,
                    label: all[i].fullname
                };
        if(removedUser != undefined)
            availableUsers.push(removedUser);

        this.setState({
            entries: new_entries,
            users: availableUsers
        });
        this.props.setUsers(new_entries);
    },
    getModalBody(){
        return <span>
                    <p>Please introduce the new user's email</p>
                    <br />
                    <input className="form-control" placeholder="Email" onChange={this.addNewUserToState}
                           value={this.state.new_user}/>
                    <br />
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
    setAssignee(val){
        this.setState({selectedUsers: val});
    },
    getDefaultProps(){
        return {
            tableSettings:
                {   noDataMessage: <center>There are currently no associated resources.</center>,
                    bodyHeight:375,
                    tableClassName: "table table-striped",
                    useGriddleStyles: false,
                    nextClassName: "table-prev",
                    previousClassName: "table-next",
                    sortAscendingComponent: <i className="pull-right fa fa-sort-asc"></i>,
                    sortDescendingComponent: <i className="pull-right fa fa-sort-desc"></i>
                },
        };
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
            <div>
                <p>Please select all the users that you want to participate in the study</p>
            </div>
            <div>
                <Select onChange={this.setAssignee} placeholder="Search for assignees"
                                    value={this.state.selectedUsers} name="form-field-name"
                                    multi={true} options={this.state.users}/>
                <AddButton extraStyle={{marginTop: '3px'}}
                            success={this.addUsersToTable}
                            label={"  Add to list"}
                            extraCss={"pull-right btn btn-success"}
                            title={"Add to list"}
                            icon={"fa fa-plus"}
                            showmodal={false}
                            new_user={this.state.new_user}/>
                <br/>
            </div>
            <br/><br/>
            <div className="panel panel-default panel-overflow griddle-pad">
                <div style={{zIndex: 0}} className="panel-heading">
                    <i className="fa fa-users pull-left"></i>
                    <h3 className="text-center panel-title"> Users</h3>
                    <AddButton extraStyle={{position: 'absolute', right: '10px', top: '7px', zIndex: 0}}
                            success={this.addNewUser}
                            label={"  Add new user"}
                            extraCss={"pull-right btn btn-xs  btn-success"}
                            title={"Add new user"}
                            onChange={this.addNewUserToState}
                            icon={"fa fa-plus"}
                            showmodal={true}
                            new_user={this.state.new_user}
                            getModalBody={this.getModalBody}/>
                </div>
                <Griddle
                    noDataMessage={<center>You don't have user to select.</center>}
                    {...this.props.tableSettings}
                    results={this.state.entries}
                    columns={["firstName", "lastName", "email", "remove"]}
                    columnMetadata={columnMeta}/>
            </div>
        </span>;
    }
});

export default {UserTable};