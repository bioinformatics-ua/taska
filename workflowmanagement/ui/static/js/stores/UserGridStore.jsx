'use strict';
import Reflux from 'reflux';
import UserGridActions from '../actions/UserGridActions.jsx';

import ResultStore from './ResultStore.jsx';

import {depmap} from '../map.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'process/my/finishedstudies', dontrepeat: true});


export default Reflux.createStore({
    statics: {
        DETAIL: 0,
        LIST: 1
    },
    merge: true,
    mixins: [TableStoreMixin, Reflux.connect(ResultStore, "dummy"),
        DetailStoreMixin.factory(
            new DetailLoader({model: 'process/my/finishedstudies'}),
            'hash',
            UserGridActions
        )
    ],
    listenables: [UserGridActions],
    load: function (state) {
        if(state.currentPage == 0 )
            this.reload(state);

        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            UserGridActions.loadSuccess(data);
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
    getDepVersion(){
        return this.dversion;
    },
});