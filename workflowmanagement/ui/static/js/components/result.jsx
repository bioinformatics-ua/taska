'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import {Modal, PermissionsBar} from './reusable/component.jsx';

import ResultActions from '../actions/ResultActions.jsx';

import ResultStore from '../stores/ResultStore.jsx';

import moment from 'moment';

export default React.createClass({
    mixins: [   Router.Navigation,
                Authentication,
                Reflux.listenTo(ResultStore, 'update')],
    statics: {
        fetch(params) {
            return ResultActions.loadDetailIfNecessary.triggerPromise(params.object).then(
                (result) => {
                    return result;
                }
            );
        }
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    displayName: route => {
        let detail = Object.keys(route.props.detail)[0];
        return `Result ${route.props.detail[detail].hash}`;
    },
    __getState(){
        return {
            result: ResultStore.getDetail()
        }
    },
    getInitialState(){
        return this.__getState();
    },
    componentWillMount(){
        //ResultActions.calibrate();
    },
    componentDidUpdate(){
    },
    update(status){
        if(status == ResultStore.DETAIL){
            this.setState(this.__getState());
        }
    },
    render() {
        let DetailResultRender = this.detailResultRender();

        return (
            <div className="result-detail row">
                <div className="col-md-12">
                    <div className="panel panel-default">
                        <div className="panel-body">
                            <div className="row">
                            TOP
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <DetailResultRender key={this.state.result.hash} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

