'use strict';
import Reflux from 'reflux';
import ProcessActions from '../actions/ProcessActions.jsx';

import {TableStoreMixin} from '../mixins/store.jsx';
import {ListLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'process'});

export default Reflux.createStore({
    mixins: [TableStoreMixin],
    listenables: [ProcessActions],
    load: function (state) {
        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            ProcessActions.loadSuccess(data);
        }, state);
    }
});
