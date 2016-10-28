'use strict';

import React from 'react';

import {Authentication} from '../mixins/component.jsx';

import UserActions from '../actions/UserActions.jsx';
import UserStore from '../stores/UserStore.jsx';

export default React.createClass({
    displayName: "Activate",
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
    approve(){
        let params = this.context.router.getCurrentParams();

        UserActions.approve(params.email);
    },
    render() {
        let params = this.context.router.getCurrentParams();
        return (
            <div className="panel panel-default">
                <div className="panel-heading"><strong>Approve {params.email}</strong></div>
                <div className="panel-body">
                    <center><p> Are you sure you want to approve user {params.email} ?</p>

                    <button onClick={this.approve} className="btn btn-success">Approve</button>
                    </center>
                </div>
            </div>
        );
      }
});
