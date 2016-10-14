'use strict';
import Reflux from 'reflux';
import AllTaskActions from '../actions/AllTaskActions.jsx';
import StateActions from '../actions/StateActions.jsx';
import ResultActions from '../actions/ResultActions.jsx';

import ResultStore from './ResultStore.jsx';

import {depmap} from '../map.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'process/my/alltasks', dontrepeat: true});


export default Reflux.createStore({
    statics: {
        DETAIL: 0,
        LIST: 1
    },
    merge: true,
    mixins: [TableStoreMixin, Reflux.connect(ResultStore, "dummy"),
        DetailStoreMixin.factory(
            new DetailLoader({model: 'process/my/alltasks'}),
            'hash',
            AllTaskActions
        )
    ],
    listenables: [AllTaskActions],
    load: function (state) {
        if(state.currentPage == 0 )
            this.reload(state);

        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            AllTaskActions.loadSuccess(data);
        }, state);
    },
    dummy(s){},
    init(){
        this.answer = {};
        this.dversion = 0;
        this.v=1;
    },
    reload(state){
        this.__list = [];
        state.currentPage = 0;
        state.reload = true;
    },
    onAccept(ptuhash){
        this.onMethodDetail('accept',
                            null,
                            'POST', {
                                ptuhash: ptuhash
                            })
            .then(
            (data) => {
                this.__detaildata = data;
                this.__v++;

                this.reload(this.__current);
                this.load(this.__current);
                this.trigger(this.DETAIL);
            }
        );
    },
    onReject(ptuhash){
        this.onMethodDetail('reject',
                            null,
                            'POST', {
                                ptuhash: ptuhash
                            })
            .then(
            (data) => {
                this.__detaildata = data;
                this.__v++;

                this.reload(this.__current);
                this.load(this.__current);
                this.trigger(this.DETAIL);
            }
        );
    },
    getDepVersion(){
        return this.dversion;
    }
});