'use strict';
import Reflux from 'reflux';
import ProcessActions from '../actions/ProcessActions.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';

import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'process'});

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
    onCalibrate(){
        this.__missing=[];

        this.trigger();
    },
    onCancel(){
        ProcessActions.methodDetail.triggerPromise('cancel', this.__detaildata.hash).then(
            (data) => {
                this.__detaildata = data;
                this.trigger(this.DETAIL);
            }
        );
    }
});
