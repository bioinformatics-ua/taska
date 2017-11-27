'use strict';
import React from 'react';
import {LayeredComponentMixin} from '../../../mixins/component.jsx';
import Modal from '../modal.jsx';
import StateActions from '../../../actions/StateActions.jsx';
import ProcessActions from '../../../actions/ProcessActions.jsx';
import Reminders from '../Reminders.jsx'

const ReminderButton = React.createClass({
    mixins: [LayeredComponentMixin],
    getDefaultProps(){
        return {
            text: 'Unamed button',
            extraCss: '',
            existentReminders: {
                before: "",
                after: "",
                repeatUpTo: null
            }
        };
    },
    handleClose() {
        this.setState({
            clicked: false,
            showErrorMessage: false
        });
    },
    handleClick() {
        this.setState({clicked: !this.state.clicked});
    },
    getInitialState() {
        return {
            clicked: false,
            showErrorMessage: false,
            reminders:this.props.existentReminders,
        };
    },
    setReminders(reminders){
        this.setState({reminders: reminders});
    },
    getModalBody(){
        return <div className="status-detail">
                    <div className="col-md-12">
                        <Reminders setReminders={this.setReminders} reminders={this.props.existentReminders} />
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            { this.state.showErrorMessage ?
                                <div className="smalert alert alert-danger alert-dismissible fade in" role="alert">
                                    <button type="button" onClick={this.closeErrorMessage}  className="close" data-dismiss="alert" aria-label="Close">
                                        <span aria-hidden="true">×</span></button>
                                    <strong>Error: </strong>To set up a reminder after deadline you need to fill both fields
                                </div>
                            :''}
                        </div>
                    </div>
                </div>;
    },
    getModalFooter(){
        return <span>
                    <button type="button" onClick={this.handleClose} className="btn btn-default" data-dismiss="modal">{'Cancel'}</button>
                    <button type="button" onClick={this.success} className="btn btn-primary">{'Ok'}</button>
                </span>;
    },
    success(){
        console.log(this.state);
        if(this.validateReminders()){
            this.setState({showErrorMessage: true});
        }
        else{
            ProcessActions.changeReminders(this.state.reminders);
            this.handleClose();
        }
    },
    validateReminders(){
        return true;
        //(this.state.reminders.after != 0 && this.state.reminders.repeatUpTo == null) || (this.state.reminders.after == 0 && this.state.reminders.repeatUpTo != null))
    },
    closeErrorMessage(){
        this.setState({showErrorMessage: false});
    },
    renderLayer() {
        if (this.state.clicked) {
            return <Modal title={"Reminders"}
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

export default ReminderButton;