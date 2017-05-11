'use strict';
import React from 'react';
import {LayeredComponentMixin} from '../../../mixins/component.jsx';
import Modal from '../modal.jsx';
import UserTable from '../usergrid.jsx';
import UserActions from '../../../actions/UserActions.jsx';

const ButtonToAddUsersModal = React.createClass({
    mixins: [LayeredComponentMixin],
    getDefaultProps(){
        return {
            text: 'Unamed button',
            extraCss: ''
        };
    },
    handleClose() {
        this.setState({clicked: false});
    },
    handleClick() {
        this.setState({clicked: !this.state.clicked});
    },
    getInitialState() {
        return {
            clicked: false,
            users: []
        };
    },
    setUsers(list){
        this.setState({users: list});
    },
    getModalBody(){
        return <span>
                <UserTable hash={""} setUsers={this.setUsers} receivedUser={this.props.receivedUser}/>
                </span>;
    },
    getModalFooter(){
        return <span>
                    <button type="button" onClick={this.handleClose} className="btn btn-default" data-dismiss="modal">{'Cancel'}</button>
                    <button type="button" onClick={this.success} className="btn btn-primary">{'Ok'}</button>
                </span>;
    },
    success(){
        UserActions.invite(this.state.users, this.props.setUsers, this.handleClose);
    },
    renderLayer() {
        if (this.state.clicked) {
            return <Modal title={"Add more users"}
                      modalbody={this.getModalBody()}
                      modalfooter={this.getModalFooter()}
                      close={this.handleClose} />;
        } else {
            return <span />;
        }
    },
    render() {
        return <button className={`btn ${this.props.extraCss}`} onClick={this.handleClick}>
            <i className={this.props.icon} />&nbsp;{this.props.text}</button>;
    }
});

export default ButtonToAddUsersModal;