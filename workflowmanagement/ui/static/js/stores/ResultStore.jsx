'use strict';
import Reflux from 'reflux';
import ResultActions from '../actions/ResultActions.jsx';
import StateActions from '../actions/StateActions.jsx';
import depmap from '../map.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';

import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'result'});

export default Reflux.createStore({
    mixins: [TableStoreMixin,
        DetailStoreMixin.factory(
            new DetailLoader({model: 'result'}),
            'hash',
            ResultActions
        )
    ],
    listenables: [ResultActions],
    load: function (state) {
        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            ResultActions.loadSuccess(data);
        }, state);
    },
    init(){
        this.__missing=[];
    },
    onDeleteResult(hash){
        ResultActions.deleteDetail.triggerPromise(hash).then(
            (result) => {
                this.load(this.__current);
            }
        );
    },
    onCalibrate(data){
        this.__detaildata = {
            task: data.processtask.task,
            process: data.processtask.process,
            type: depmap[data.processtask.parent.type]
        };
    },
    getAnswer(){
        return this.__detaildata || {};
    },
    onUnloadAnswer(){
        this.__detaildata = {};
    },
    onSetAnswer(prop, val){
        this.__detaildata[prop] = val;

        //this.trigger(this.DETAIL);
    },
    answerSubmitted(){
        return this.__rfinished || false;
    },
    onSaveAnswer(){
        StateActions.loadingStart();

        ResultActions.addDetail.triggerPromise(this.__detaildata).then(
            (answer) => {
                StateActions.loadingEnd();

                this.__rfinished = answer;
                this.trigger();
            }
        )
    }
});
