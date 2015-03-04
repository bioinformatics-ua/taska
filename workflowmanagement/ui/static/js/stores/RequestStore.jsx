'use strict';
import Reflux from 'reflux';
import RequestActions from '../actions/RequestActions.jsx';

import {TableStoreMixin} from '../mixins/store.jsx';
import {ListLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'process/requests'});

export default Reflux.createStore({
    mixins: [TableStoreMixin],
    listenables: [RequestActions],
    load: function (state) {
        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            RequestActions.loadSuccess(data);
        }, state);
    }
});
