'use strict';

import React from 'react';

import Reflux from 'reflux';
import WorkflowActions from '../actions/WorkflowActions.jsx';
import ProcessActions from '../actions/ProcessActions.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'workflow'});

import StateActions from '../actions/StateActions.jsx';

const WorkflowStore = Reflux.createStore({
    statics: {
        DETAIL: 0,
        LIST: 1
    },
    mixins: [TableStoreMixin,
        DetailStoreMixin.factory(
            new DetailLoader({model: 'workflow'}),
            'hash',
            WorkflowActions
        )
    ],
    listenables: [WorkflowActions],
    load: function (state) {
        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            WorkflowActions.loadSuccess(data);
        }, state);
    },
    init(){
        this.__missing=[];
    },
    onCalibrate(){
        this.__missing=[];
        this.__pfinished=false;
        this.__wfinished=false;

        this.trigger();
    },
    getMissing(){
        return this.__missing;
    },
    getProcessAddFinished(){
        return this.__pfinished || false;
    },
    getWorkflowAddFinished(){
        return this.__wfinished || false;
    },
    resetDetail(){
        this.__detaildata = {
                        permissions: {
                            public: true,
                            forkable: true,
                            searchable: true
                        }
                    };
    },
    onDeleteWorkflow(hash){
        WorkflowActions.deleteDetail.triggerPromise(hash).then(
            (result) => {
                this.load(this.__current);
            }
        );
    },
    getWorkflow(){
        return this.__detaildata;
    },
    onSetPublic(status){
        this.__detaildata.permissions.public = status;
        StateActions.waitSave();
        //this.trigger(WorkflowStore.DETAIL);
    },
    onSetSearchable(status){
        this.__detaildata.permissions.searchable = status;
        StateActions.waitSave();
        //this.trigger(WorkflowStore.DETAIL);
    },
    onSetForkable(status){
        this.__detaildata.permissions.forkable = status;
        StateActions.waitSave();
        //this.trigger(WorkflowStore.DETAIL);
    },
    onSetWorkflow(data){
        let workflow = this.__detaildata;

        workflow.title = data.title;

        if(!workflow.title){
            StateActions.alert(
                {
                    'title':'Missing Title',
                    'message': 'The study template must have a title!'
                }
            );

            return;
        }

        workflow.tasks = [];

        let failed = [];

        let states = data.sm.getStates();

        for(let state of states){
            if(!state.is_valid())
                failed.push(state);
            workflow.tasks.push(state.serialize());
        }

        if(workflow.tasks.length === 0){
            StateActions.alert(
                {
                    'title':'Empty study template',
                    'message': 'The study template cannot be empty, try to add some tasks first.'
                }
            );

            return;
        }

        if(failed.length > 0){
            StateActions.alert(
                {
                    'title':'Missing Fields',
                    'message':(
                        <span>
                    The workflow is currently invalid, because it is missing mandatory parameters on the following states:<br />
                    {failed.map((curr)=>{
                        return <span>{curr.label()}<br /></span>;
                    })}</span>)
                }
            );
        } else {
            StateActions.loadingStart();
            if(workflow.hash)
                WorkflowActions.postDetail.triggerPromise(workflow.hash, workflow).then(
                        (workflow) => {
                            StateActions.loadingEnd();
                            StateActions.save();
                            this.trigger();
                        }
                );
            else
                  WorkflowActions.addDetail.triggerPromise(workflow).then(
                        (workflow) => {
                            StateActions.loadingEnd();
                            StateActions.save(true, ()=>{
                                this.__wfinished = workflow;
                                this.trigger();
                            });

                        }
                );
        }
    },
    onCheckAvailability(data)
    {
        console.log(data);
        let process = {
            ***REMOVED*** this.__detaildata.hash,
            tasks: [],
            title: data.title,
            status: 5
        };

        let states = data.sm.getStates();
        let missing = [];
        
        for(let state of states)
        {
            let serialized = state.serialize();

            if(!state.is_valid()){
                missing.push(serialized);
            }

            process.tasks.push(serialized);
        }
        this.__missing = missing

        if(this.__missing.length == 0){
            StateActions.loadingStart();
            ProcessActions.addDetail.triggerPromise(process).then(
                (process) => {
                    StateActions.loadingEnd();
                    this.__pfinished = process;
                    this.trigger();
                }
            )
        }

        this.trigger();
    },
    onRunProcess(data){
        let process = {
            ***REMOVED*** this.__detaildata.hash,
            tasks: [],
            title: data.title,
            status: 1,

            days_after_delay: data.notificationsDetail.numDaysAfter,
            days_before_delay: data.notificationsDetail.numDaysBefore,
            send_notification_until: data.notificationsDetail.sendNotificationUntil
        };

        let states = data.sm.getStates();
        let missing = [];

        for(let state of states){
            let serialized = state.serialize();

            if(!state.is_valid()){
                missing.push(serialized);
            }

            process.tasks.push(serialized);
        }

        this.__missing = missing;


        if(this.__missing.length == 0){
            StateActions.loadingStart();
            ProcessActions.addDetail.triggerPromise(process).then(
                (process) => {
                    StateActions.loadingEnd();
                    this.__pfinished = process;
                    this.trigger();
                }
            )
        }

        this.trigger();

    },
    onFork(){
        let workflow = this.__detaildata;

        if(workflow.hash){
            StateActions.loadingStart();
            this.onMethodDetail('fork', workflow.hash).then(
                (workflow) => {
                    StateActions.loadingEnd();
                    this.__wfinished = workflow;
                    this.trigger();
                }
            );
        }

    }
});

export default WorkflowStore;
