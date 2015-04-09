'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import {Modal, PermissionsBar} from './reusable/component.jsx';

import RequestActions from '../actions/RequestActions.jsx';

import RequestStore from '../stores/RequestStore.jsx';

export default React.createClass({
    mixins: [   Router.Navigation,
                Authentication,
                Reflux.listenTo(RequestStore, 'update')],
    statics: {
        fetch(params) {
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
        return `Request ${route.props.detail.Request.title}`;
    },
    __getState(){
        return {
            request: RequestStore.getDetail(),
        }
    },
    getInitialState(){
        return this.__getState();
    },
    componentWillMount(){
    },
    componentDidUpdate(){
    },
    update(status){
        if(status == RequestStore.DETAIL){
            this.setState(this.__getState());
        }
    },
    render() {
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
                                          <span className="form-control">{this.state.request.title}</span>
                                        </div>
                                      </div>
                                </div>
                                <div className="col-md-5">
                                      <div className="form-group">
                                        <div className="input-group">
                                          <span className="input-group-addon"><strong>Type</strong></span>
                                          <span className="form-control">{this.state.request['type_repr']}</span>
                                        </div>
                                      </div>
                                </div>
                                     <div className="col-md-12">
                                            <div className="form-group">
                                                <div className="input-group">
                                                  <span className="input-group-addon"><strong>Message</strong></span>
                                                  <span style={{float: 'none'}} className="form-control">
                                                    {this.state.request.message}
                                                  </span>
                                                </div>
                                            </div>
                                        </div>
                            </div>
                            <hr style={{marginTop:0}} />
                            <div className="row">
                                <div className="col-md-9"></div>
                                <div className="col-md-3">
                                        <button className="btn btn-primary btn-block btn-default">
                                            <i style={{marginTop: '3px'}} className="pull-left fa fa-floppy-o"></i> Reply
                                        </button>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

