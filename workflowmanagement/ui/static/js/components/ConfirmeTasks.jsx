'use strict';

import React from 'react';

import {Authentication} from '../mixins/component.jsx';

import UserActions from '../actions/UserActions.jsx';
import UserStore from '../stores/UserStore.jsx';

export default React.createClass({
    displayName: "Confirme tasks",
    mixins: [Authentication],
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    getInitialState(){
        return {
            user: UserStore.getUser(),
        };
    },
    componentDidMount(){
        if(this.state.user && !this.state.user['is_staff']){
            this.context.router.transitionTo('home');
        }
    },
    accept(){
        let params = this.context.router.getCurrentParams();

        //UserActions.approve(params.email);
    },
    reject(){
        let params = this.context.router.getCurrentParams();

        //UserActions.approve(params.email);
    },
    render() {
        let params = this.context.router.getCurrentParams();
        return (
            <div className="panel panel-default">
                <div className="panel-heading"><strong>Accept or reject the tasks </strong></div>
                <div className="panel-body">
                    <center>
                        <p> Do you want accept or reject this tasks ?</p>

                    <button onClick={this.accept} className="btn btn-success">Accept</button>
                    <button onClick={this.reject} className="btn btn-danger">Reject</button>
                    </center>
                </div>
            </div>
        );
      }
});
