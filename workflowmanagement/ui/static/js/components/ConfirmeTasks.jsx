'use strict';
import Reflux from 'reflux';
import React from 'react';

import {Authentication} from '../mixins/component.jsx';

import UserActions from '../actions/UserActions.jsx';

import UserStore from '../stores/UserStore.jsx';

import ProcessStore from '../stores/ProcessStore.jsx';

import ProcessActions from '../actions/ProcessActions.jsx';

export default React.createClass({
    displayName: "Confirm tasks",
    mixins: [Authentication],
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    __getState(){
        return {
            user: UserStore.getUser(),
            process: ProcessStore.getDetail()
        };
    },
    getInitialState(){
        return this.__getState();
    },
    componentDidMount(){
      /*  if(this.state.user && !this.state.user['is_staff']){
            this.context.router.transitionTo('home');
        }*/
    },
    accept(){
        let params = this.context.router.getCurrentParams();
        console.log(params.hash);
        ProcessActions.accept(params.hash);
    },
    reject(){
        let params = this.context.router.getCurrentParams();
        
        ProcessActions.reject(params.hash);
    },
    render() {
        let params = this.context.router.getCurrentParams();

        return (
            <div className="panel panel-default">
                <div className="panel-heading"><strong>Confirm your participation to {this.state.process['object_repr']}</strong></div>
                <div className="panel-body">
                    <center>
                        <h5>The tasks assigned to you are:</h5>
                        <p> Do you want to accept this tasks ?</p>

                    <button onClick={this.accept} className="btn btn-success">Accept</button>
                    <button onClick={this.reject} className="btn btn-danger">Reject</button>
                    </center>
                </div>
            </div>
        );
      }
});
