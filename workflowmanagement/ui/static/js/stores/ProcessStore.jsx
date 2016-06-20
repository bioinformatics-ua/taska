'use strict';
import Reflux from 'reflux';
import ProcessActions from '../actions/ProcessActions.jsx';
import StateActions from '../actions/StateActions.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';

import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'process'});

import WorkflowStore from './WorkflowStore.jsx';
import {StateMachineComponent} from '../react-statemachine/component.jsx';

import {StateMachine, SimpleState} from '../react-statemachine/classes.jsx';

import {SimpleTask, SimpleTaskRun} from '../components/reusable/states/SimpleTask.jsx';

import {FormTask, FormTaskRun} from '../components/reusable/states/FormTask.jsx';

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
        this.__validation = [];
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
        this.onMethodDetail('cancel', this.__detaildata.hash).then(
            (data) => {
                this.__detaildata = data;
                this.__v++;

                this.trigger(this.DETAIL);
            }
        );
    },
    onCancelUser(ptask, user, val){
        this.onMethodDetail('canceluser',
                            this.__detaildata.hash,
                            'POST', {
                                ptask: ptask,
                                user: user,
                                val: val
                            })
            .then(
            (data) => {
                this.__detaildata = data;
                this.__v++;

                this.trigger(this.DETAIL);
            }
        );
    },
    onRefineAnswer(ptu){

        StateActions.alert(
        {
            'title':'Refine Answer',
            'message': 'This will mark this answer as incomplete, and will request of the user assigned to it to improve the answer. Are you sure you want to do this ?',
            onConfirm: (context)=>{
                StateActions.loadingStart();

                this.onMethodDetail('refine',
                                    this.__detaildata.hash,
                                    'POST', {
                                        ptu: ptu
                                    })
                    .then(
                    (data) => {
                        StateActions.loadingEnd();
                        StateActions.save();
                        StateActions.dismissAlert();

                        this.__detaildata = data;
                        this.__v++;

                        this.trigger(this.DETAIL);
                    }
                );
            }
        });
    },
    onAddUser(ptask, user){
        this.onMethodDetail('adduser',
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
    getValidation(hash){
        return this.__validation[hash];
    },
    onValidateAcceptions(hash){
        this.onMethodDetail('validateAcceptions', hash).then(
            (result) => {
                console.log(hash);
                console.log(result.valid);
                this.__validation[hash] = result.valid;
                this.trigger();
            }
        );
    },
    onChangeDeadline(ptask, deadline){
        this.onMethodDetail('changedeadline',
                            this.__detaildata.hash,
                            'POST', {
                                ptask: ptask,
                                deadline: deadline
                            })
            .then(
            (data) => {
                this.__detaildata = data;
                this.__v++;

                this.trigger(this.DETAIL);
            }
        );
    },
    onReject(ptuhash){
        this.onMethodDetail('my/task/aprove/reject',
                            this.__detaildata.hash,
                            'POST', {
                                ptuhash: ptuhash
                            })
            .then(
            (data) => {
                this.__detaildata = data;
                this.__v++;

                this.trigger(this.DETAIL);
            }
        );
    },
    onAccept(ptuhash){
        this.onMethodDetail('my/task/aprove/accept',
                            this.__detaildata.hash,
                            'POST', {
                                ptuhash: ptuhash
                            })
            .then(
            (data) => {
                this.__detaildata = data;
                this.__v++;

                this.trigger(this.DETAIL);
            }
        );

    },
    onStartProcess(hash){
        this.onMethodDetail('startProcess',
                            this.__detaildata.hash,
                            'POST', {
                                hash: hash
                            })
            .then(
            (data) => {
                this.__detaildata = data;
                this.__v++;

                this.trigger(this.DETAIL);
            }
        );
    },
    onReassignRejectedUser(hash, oldUser, newUser, allTasks){
        this.onMethodDetail('reassignRejectedUser',
                            this.__detaildata.hash,
                            'POST', {
                                hash: hash,
                                oldUser: oldUser,
                                newUser: newUser,
                                allTasks: allTasks
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

            process_sm.addStateClass({
                id: 'form.FormTask',
                Class: FormTaskRun
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
