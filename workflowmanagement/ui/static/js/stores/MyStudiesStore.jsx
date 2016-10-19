'use strict';
import Reflux from 'reflux';
import MyStudiesActions from '../actions/MyStudiesActions.jsx';

import ResultStore from './ResultStore.jsx';

import {depmap} from '../map.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'process/my/studies', dontrepeat: true});


export default Reflux.createStore({
    statics: {
        DETAIL: 0,
        LIST: 1
    },
    merge: true,
    mixins: [TableStoreMixin, Reflux.connect(ResultStore, "dummy"),
        DetailStoreMixin.factory(
            new DetailLoader({model: 'process/my/studies'}),
            'hash',
            MyStudiesActions
        )
    ],
    listenables: [MyStudiesActions],
    load: function (state) {
        if(state.currentPage == 0 )
            this.reload(state);

        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            MyStudiesActions.loadSuccess(data);
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
    }
});