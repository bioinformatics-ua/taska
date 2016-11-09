'use strict';
import Reflux from 'reflux';
import RequestByProcessActions from '../actions/RequestByProcessActions.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader;// = new ListLoader({model: 'process/requestsbyprocess'});

import StateActions from '../actions/StateActions.jsx';

import UserStore from './UserStore.jsx';

export default Reflux.createStore({
    mixins: [TableStoreMixin,
        DetailStoreMixin.factory(
            new DetailLoader({model: 'process/requestsbyprocess'}),
            'hash',
            RequestByProcessActions
        ),
    ],
    listenables: [RequestByProcessActions],
    load: function (state) {
        let self = this;
        loader = new ListLoader({model: 'process/requestsbyprocess/'+ state.hash}); //I dont know if this way is the best way to do it
        loader.load(function(data){
            self.updatePaginator(state);
            RequestByProcessActions.loadSuccess(data);
        }, state);
    }
});