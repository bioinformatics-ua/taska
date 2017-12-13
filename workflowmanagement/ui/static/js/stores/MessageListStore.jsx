'use strict';
import Reflux from 'reflux';
import MessageListActions from '../actions/MessageListActions.jsx';

import ResultStore from './ResultStore.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader;

export default Reflux.createStore({
    mixins: [TableStoreMixin , Reflux.connect(ResultStore, "dummy")],
    listenables: [MessageListActions],
    load: function (state, hash) {
        let self = this;
        loader = new ListLoader({model: 'message/list/?hash=' + hash, withparams: true});
        loader.load(function (data) {
            self.updatePaginator(state);
            MessageListActions.loadSuccess(data);
        }, state);
    },
});
