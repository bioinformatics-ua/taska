'use strict';
import Reflux from 'reflux';
import TaskActions from '../actions/TaskActions.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'process/my/tasks'});

export default Reflux.createStore({
    mixins: [TableStoreMixin,
        DetailStoreMixin.factory(
            new DetailLoader({model: 'process/my/task'}),
            'hash',
            TaskActions
        )
    ],
    listenables: [TaskActions],
    load: function (state) {
        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            TaskActions.loadSuccess(data);
        }, state);
    }
});
