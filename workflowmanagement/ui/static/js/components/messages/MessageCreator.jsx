'use strict';
import React from 'react';
import Router from 'react-router';
import Reflux from 'reflux';
import Select from 'react-select';

import {Authentication} from '../../mixins/component.jsx';

import MessageActions from '../../actions/MessageActions.jsx';
import MessageStore from '../../stores/MessageStore.jsx';

const MessageCreator = React.createClass({
    mixins: [   Router.Navigation,
                Authentication,
                Reflux.listenTo(MessageStore, 'update')],
    statics: {
        fetch(params) {
            return new Promise(function (fulfill, reject){
                MessageStore.init();
                fulfill({});
            });
        }
    },
    getState(){
        return {
            message: MessageStore.getMessage(),
            users: MessageStore.getUsers(),
            sended: false
        };
    },
    getInitialState(){
        return this.getState();
    },
    componentWillMount(){
        let params = this.context.router.getCurrentParams();

        MessageActions.calibrate(params.object, params.hash);

        switch (params.object){
            case 'process':
                this.setState({
                    objectType: 15,
                    usersSelectPlaceholder: "Leave empty to send message to all users involved in this study",
                });
                break;
            case 'processTask':
                this.setState({
                    objectType: 16,
                    usersSelectPlaceholder: "Leave empty to send message to all users involved in this task",
                });
                break;
        }
    },
    componentDidUpdate(){
        if(this.state.sended){
            this.goBackAndClean();
        }
    },
    update(status){
        this.setState(this.getState());
    },
    setReqMessage(e){
        MessageActions.setMessage(e.target.value);
    },
    setReqTitle(e){
        MessageActions.setTitle(e.target.value);
    },
    goBackAndClean(){
        this.goBack();
    },
    setRequest(e){
        let hash = this.context.router.getCurrentParams().hash;
        MessageActions.setObjectType(this.state.objectType, hash);
        MessageActions.send();
        this.setState({sended: true});

    },
    setReceivers(val){
        let receivers = [];
        let users = val.split(",");
        for( var index = 0; index < users.length ;  index++)
            receivers[index] = parseInt(users[index]);
        MessageActions.setReceivers(receivers);
    },
    render(){
        return (
            <div className="request-detail row">
                <div className="col-md-12">
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <center>
                                <i className="fa fa-envelope pull-left"></i>
                                <h3 className="panel-title">Send message</h3>
                            </center>
                        </div>
                        <div className="panel-body">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <span className="input-group-addon"><strong>To</strong></span>
                                            <Select onChange={this.setReceivers} placeholder={this.state.usersSelectPlaceholder}
                                                defaultValue={this.state.message.receivers} name="form-field-name"
                                                multi={true} 
                                                options={this.state.users}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <span className="input-group-addon"><strong>Subject</strong></span>
                                            <input onChange={this.setReqTitle} className="form-control"
                                                   defaultValue={this.state.message.title}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <span className="input-group-addon"><strong>Message</strong></span>
                                                <textarea onChange={this.setReqMessage} rows="7"
                                                          className="form-control" defaultValue={this.state.message.message}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-9">

                                </div>
                                <div className="col-md-3">
                                    <div className="btn-group" role="group">
                                        <button type="button" onClick={this.goBackAndClean}
                                                className="btn btn-danger btn-default">
                                            <i style={{marginTop: '3px'}} className="pull-left fa fa-ban"></i> Cancel
                                        </button>
                                        <button type="button" onClick={this.setRequest}
                                                className="btn btn-primary btn-default">
                                            <i style={{marginTop: '3px'}} className="pull-left fa fa-envelope"></i> Send
                                            message
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <br />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

export default MessageCreator;