'use strict';
import Reflux from 'reflux';
import WorkflowActions from '../actions/WorkflowActions.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'workflow'});

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
    getWorkflow: function(){
        return this.__detaildata;
    },
    setPublic(status){
        this.__detaildata.permissions.public = status;

        this.trigger(WorkflowStore.DETAIL);
    },
    setSearchable(status){
        this.__detaildata.permissions.searchable = status;

        this.trigger(WorkflowStore.DETAIL);
    },
    setForkable(status){
        this.__detaildata.permissions.forkable = status;

        this.trigger(WorkflowStore.DETAIL);
    }
});

export default {WorkflowStore};
