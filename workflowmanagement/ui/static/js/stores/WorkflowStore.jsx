'use strict';
import Reflux from 'reflux';
import WorkflowActions from '../actions/WorkflowActions.jsx';

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
            'email',
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

        this.trigger(WorkflowStore.DETAIL);
    },
    onSetSearchable(status){
        this.__detaildata.permissions.searchable = status;

        this.trigger(WorkflowStore.DETAIL);
    },
    onSetForkable(status){
        this.__detaildata.permissions.forkable = status;

        this.trigger(WorkflowStore.DETAIL);
    },

    onSetWorkflow(data){
        let workflow = this.__detaildata;

        workflow.title = data.title;

        workflow.tasks = [];

        let states = data.sm.getStates();

        for(let state of states){
            workflow.tasks.push(state.serialize());
        }
        StateActions.loadingStart();
        if(workflow.hash)
            WorkflowActions.postDetail.triggerPromise(workflow.hash, workflow).then(
                    (workflow) => {
                        StateActions.loadingEnd();
                        this.trigger();
                    }
            );
        else
              WorkflowActions.addDetail.triggerPromise(workflow).then(
                    (workflow) => {
                        StateActions.loadingEnd();
                        this.trigger();
                    }
            );
    }
});

export default WorkflowStore;
