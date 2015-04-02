'use strict';
import Reflux from 'reflux';
import TaskActions from '../actions/TaskActions.jsx';
import StateActions from '../actions/StateActions.jsx';
import ResultActions from '../actions/ResultActions.jsx';

import ResultStore from './ResultStore.jsx';

import depmap from '../map.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'process/my/tasks'});

export default Reflux.createStore({
    statics: {
        DETAIL: 0,
        LIST: 1
    },
    mixins: [TableStoreMixin, Reflux.connect(ResultStore, "dummy"),
        DetailStoreMixin.factory(
            new DetailLoader({model: 'process/my/task'}),
            'hash',
            TaskActions
        )
    ],
    listenables: [TaskActions],
    load: function (state) {
        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            TaskActions.loadSuccess(data);
        }, state);
    },
    dummy(s){},
    init(){
        this.answer = {};

    },
    onCalibrate(){
        this.answer = {
            task: this.__detaildata.task,
            process: this.__detaildata.process,
            type: depmap[this.__detaildata.parent.type]
        };
    },
    getAnswer(){
        return this.answer || {};
    },
    onSetAnswer(prop, val){
        this.answer[prop] = val;

        //this.trigger(this.DETAIL);
    },
    onSaveAnswer(){
        console.log(this.answer);
        StateActions.loadingStart();
        console.log(ResultActions);
        ResultActions.addDetail.triggerPromise(this.answer).then(
            (answer) => {
                StateActions.loadingEnd();
            }
        )
    }
});
