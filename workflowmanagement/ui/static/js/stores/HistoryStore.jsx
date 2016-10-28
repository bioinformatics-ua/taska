'use strict';
import Reflux from 'reflux';
import HistoryActions from '../actions/HistoryActions.jsx';

import {TableStoreMixin} from '../mixins/store.jsx';
import {ListLoader} from '../actions/api.jsx'

    let loader = new ListLoader({model: 'history', dontrepeat: true});
let dloader;

const HistoryStore = Reflux.createStore({
    merge: true,
    mixins: [TableStoreMixin],
    listenables: [HistoryActions],
    load: function (state) {
        console.log('LOADING GLOBAL HISTORY');
        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            HistoryActions.loadSuccess(data);
        }, state);
    }
});

export default HistoryStore;
