'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import {Modal, PermissionsBar} from './reusable/component.jsx';

import RequestActions from '../actions/RequestActions.jsx';

import RequestStore from '../stores/RequestStore.jsx';

import UserStore from '../stores/UserStore.jsx';

import Select from 'react-select';

export default React.createClass({
    mixins: [   Router.Navigation,
                Authentication,
                Reflux.listenTo(RequestStore, 'update')],
    statics: {
        fetch(params) {
            if(params.object == 'add'){
                return new Promise(function (fulfill, reject){
                    RequestStore.resetDetail(params);
                    fulfill({});
                });
            }
            return RequestActions.loadDetailIfNecessary.triggerPromise(params.object).then(
                (request) => {
                    return request;
                }
            );
        }
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    displayName: route => {
        try {
            if(route.props.detail.RequestAdd)
                return `Add Request`;
            else
                return `Request - ${route.props.detail.Request.title}`;
        } catch(ex){
            return "Request Not Found";
        }
    },
    __getState(){
        return {
            request: RequestStore.getDetail(),
            user: UserStore.getUser(),
            response: RequestStore.getResponse(),
            addedRequest: RequestStore.getRequestAddFinished()
        };
    },
    getInitialState(){
        return this.__getState();
    },
    componentWillMount(){
        RequestActions.calibrate();
    },
    componentDidUpdate(){
        if(this.state.addedRequest){
            this.context.router.transitionTo('Request', {object: this.state.addedRequest.hash})
        }
    },
    update(status){
        if(status == RequestStore.DETAIL){
            this.setState(this.__getState());
        }
    },
    setTitle(e){
        RequestActions.setTitle(e.target.value);
    },
    setDesc(e){
        RequestActions.setDesc(e.target.value);
    },
    isMe(){
        if(this.state.user.id===this.state.request['process_owner'])
            return true;

        return false;
    },
    didWrite(){
        if(!this.state.request.processtaskuser)
            return true;

        if(this.state.user.id === this.state.request.processtaskuser.user)
            return true;

        return false;
    },
    setResponse(){
        RequestActions.submitResponse();
    },
    setRequest(){
        RequestActions.submitRequest();
    },
    setReqTitle(e){
        RequestActions.setReqTitle(e.target.value);
    },
    setReqType(e){
        RequestActions.setReqType(Number.parseInt(e));
    },
    setReqMessage(e){
        RequestActions.setReqMessage(e.target.value);
    },
    render() {
        if(this.props.failed){
            let Failed = this.props.failed;
            return <Failed />;
        }

        return (
            <div className="request-detail row">
                <div className="col-md-12">
                    <div className="panel panel-default">
                        <div className="panel-body">
                            <div className="row">
                                <div className="col-md-7">
                                      <div className="form-group">
                                        <div className="input-group">
                                          <span className="input-group-addon"><strong>Title</strong></span>
                                          <input disabled={!this.didWrite()} onChange={this.setReqTitle} className="form-control" value={this.state.request.title}/>
                                        </div>
                                      </div>
                                </div>
                                <div className="col-md-5">
                                      <div className="form-group">
                                        <div className="input-group">
                                          <span className="input-group-addon"><strong>Type</strong></span>
                                          <Select disabled={!this.didWrite()} placeholder="Select Request Type"
                                             onChange={this.setReqType}
                                            value={`${this.state.request.type||''}`} searchable={false}
                                            options={[
                                                {value: "1", label: 'Reassignment'},
                                                {value: "2", label: 'Clarification'}
                                            ]} />
                                        </div>
                                      </div>
                                </div>
                                     <div className="col-md-12">
                                            <div className="form-group">
                                                <div className="input-group">
                                                  <span className="input-group-addon"><strong>Message</strong></span>
                                                  <textarea disabled={!this.didWrite()} onChange={this.setReqMessage} rows="3" className="form-control" value={this.state.request.message} />
                                                </div>
                                            </div>
                                        </div>
                            </div>
                            <div className="form-group row">
                                <div className="col-md-9">
                                    <strong>Status: </strong> {this.state.request.resolved?
                                        <span className="text-success"><i className="fa fa-check-circle"></i> Solved</span>
                                        :
                                            <span>{this.state.request.resolved === false?
                                                <span><i className="fa fa-clock-o"></i> Waiting response</span>
                                            :'---'}</span>
                                        }
                                </div>
                                <div className="col-md-3">
                                        {this.didWrite()?
                                            <button onClick={this.setRequest} className="btn btn-primary btn-block btn-default">
                                                <i style={{marginTop: '3px'}} className="pull-left fa fa-floppy-o"></i> Save Request
                                            </button>
                                        :''}
                                </div>
                            </div>
                            <hr style={{marginTop:0}} />
                            {this.state.response.title || this.isMe() ?
                            <span>
                            <div className="form-group row">
                                <div className="col-md-9">
                                </div>
                                <div className="col-md-3">
                                        {this.isMe()?
                                            <button onClick={this.setResponse} className="btn btn-primary btn-block btn-default">
                                                <i style={{marginTop: '3px'}} className="pull-left fa fa-floppy-o"></i> Reply
                                            </button>
                                        :''}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <div className="input-group">
                                          <span className="input-group-addon"><strong>Response Title&nbsp;&nbsp;&nbsp;</strong></span>
                                          <input className="form-control" onChange={this.setTitle}
                                          placeholder="Enter a title for the response to the request"
                                          value={this.state.response.title} disabled={!this.isMe()} />

                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <div className="input-group">
                                          <span className="input-group-addon"><strong>Res. Description</strong></span>
                                          <textarea rows="4" disabled={!this.isMe()} onChange={this.setDesc}
                                            placeholder="Enter a description for the response to the request"
                                            value={this.state.response.message} className="form-control" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </span>:''}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

