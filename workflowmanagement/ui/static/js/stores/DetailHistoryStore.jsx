'use strict';
import Reflux from 'reflux';
import DetailHistoryActions from '../actions/DetailHistoryActions.jsx';

import {TableStoreMixin} from '../mixins/store.jsx';
import {ListLoader} from '../actions/api.jsx'

let dloader;

const DetailHistoryStore = Reflux.createStore({
    merge: true,
    mixins: [TableStoreMixin],
    listenables: [DetailHistoryActions],
    load: function (state, hash) {
        console.log('DETAIL HISTORY');
        console.log(hash);
        if(hash !== undefined){
            let self = this;
            dloader = new ListLoader({model: `history/${hash}`, dontrepeat: true});

            dloader.load(function(data){
                self.updatePaginator(state);
                DetailHistoryActions.loadSuccess(data);
            }, state);
       }
    },
    onCalibrate(){
        this.__list = [];
        this.__page = 0;
        this.__page_size = 5;
        this.__max_page = 0;
        this.__count = 0;
        this.__sortcolumn = null;
        this.__sortascending = true;
        this.__current={};
    }
});

export default DetailHistoryStore;
