'use strict';
import Reflux from 'reflux';
import ProcessActions from '../actions/ProcessActions.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';

import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'process'});

import WorkflowStore from './WorkflowStore.jsx';
import {StateMachineComponent} from '../react-statemachine/component.jsx';

import {StateMachine, SimpleState} from '../react-statemachine/classes.jsx';

import {SimpleTask, SimpleTaskRun} from '../components/reusable/states/SimpleTask.jsx';

var i = 0;
export default Reflux.createStore({
    statics: {
        DETAIL: 0,
        LIST: 1
    },
    mixins: [TableStoreMixin,
        DetailStoreMixin.factory(
            new DetailLoader({model: 'process'}),
            'hash',
            ProcessActions
        )
    ],
    listenables: [ProcessActions],
    load: function (state) {
        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            ProcessActions.loadSuccess(data);
        }, state);
    },
    init(){
        this.__missing=[];
        this.__v=1;
    },
    onDeleteProcess(hash){
        ProcessActions.deleteDetail.triggerPromise(hash).then(
            (result) => {
                this.load(this.__current);
            }
        );
    },
    getMissing(){
        return this.__missing;
    },
    getVersion(){
        return this.__v;
    },
    onCalibrate(){
        this.__missing=[];

        this.trigger();
    },
    onCancel(ptask, user){
        ProcessActions.methodDetail.triggerPromise('cancel', this.__detaildata.hash).then(
            (data) => {
                this.__detaildata = data;
                this.__v++;

                this.trigger(this.DETAIL);
            }
        );
    },
    onCancelUser(ptask, user, val){
        ProcessActions.methodDetail
            .triggerPromise('canceluser',
                            this.__detaildata.hash,
                            'POST', {
                                ptask: ptask,
                                user: user,
                                val: val
                            })
            .then(
            (data) => {
                console.log(data);
                this.__detaildata = data;
                this.__v++;

                this.trigger(this.DETAIL);
            }
        );
    },
    onAddUser(ptask, user){
        ProcessActions.methodDetail
            .triggerPromise('adduser',
                            this.__detaildata.hash,
                            'POST', {
                                ptask: ptask,
                                user: user
                            })
            .then(
            (data) => {
                this.__detaildata = data;
                this.__v++;

                this.trigger(this.DETAIL);
            }
        );

    },
    getRepr(){
       i++;
       let wf = WorkflowStore.getDetail();

        let process_sm = new StateMachine();
        let checksum = 'v__'+this.__v+'__';

            process_sm.addStateClass({
                id: 'tasks.SimpleTask',
                Class: SimpleTaskRun
            });


        // I dont know if they come ordered, so i add all tasks first, an dependencies only after
        let map = {};

        // first states
        let ptasks = this.__detaildata.tasks;

        if(wf.tasks){
            for(let task of wf.tasks){
                let type = process_sm.getStateClass(task.type).Class;

                let dataopts = type.deserializeOptions(task);
                dataopts.disabled = true;

                let t=ptasks.find(pt => pt.task === task.hash);

                dataopts.i = i;

                dataopts.assignee = t.users.reduce((prev, curr, i)=>{
                                        if(i == 0)
                                            return ''+curr.user;

                                        return `${prev},${curr.user}`;
                                    },''
                                );

                dataopts.deadline = t.deadline;

                dataopts.ptask = t;
                dataopts.ptask.users = t.users;

                checksum += dataopts.ptask.status;
                let state = process_sm.stateFactory(task.sortid, type, dataopts);
                state.__data.ptask.users = t.users;

                map[task.hash] = state;
                process_sm.addState(state);
            }

            // then dependencies
            for(let task of wf.tasks)
                for(let dep of task.dependencies)
                    process_sm.addDependency(map[task.hash], map[dep.dependency]);

        }

        return [process_sm, checksum];
    }
});
