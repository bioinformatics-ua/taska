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
    mixins: [Authentication,
             Reflux.listenTo(ProcessStore, 'update')],
    statics: {
        fetch(params) {
                return new Promise(function (fulfill, reject){

                    ProcessActions.loadDetailIfNecessary.triggerPromise(params.hash).then(
                        (Process) => {
                                    fulfill({
                                        process: Process
                                    });
                        }
                    ).catch(ex=>reject(ex));
                });
        }
    },
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

        ProcessActions.accept(params.hash);
    },
    reject(){
        let params = this.context.router.getCurrentParams();
        
        ProcessActions.reject(params.hash);
    },
    render() {
        let params = this.context.router.getCurrentParams();
        let tasks = [];
        let allTasks = this.state.process['tasks'];
        allTasks.map(
            (task) => {
                task['users'].map(
                    (userTask) => {
                        if(userTask['user'] == this.state.user['id'])
                            tasks.push(task)
                    }
                )
            }
        );
        return (
            <div className="panel panel-default">
                <div className="panel-heading"><strong>Confirm your participation to {this.state.process['object_repr']}</strong></div>
                <div className="panel-body">
                    <center>
                        <h5>The tasks assigned to you are:</h5>
                        {tasks.map(
                                    (task) => {
                                            return (
                                                <p>{task['task_repr']}<br/></p>
                                            );
                                    })
                                }
                        <p> Do you want to accept this tasks ?</p>

                    <button onClick={this.accept} className="btn btn-success">Accept</button>
                    <button onClick={this.reject} className="btn btn-danger">Reject</button>
                    </center>
                </div>
            </div>
        );
      }
});
