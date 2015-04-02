'use strict';
import Reflux from 'reflux';
import ResultActions from '../actions/ResultActions.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';

import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'result'});

export default Reflux.createStore({
    mixins: [TableStoreMixin,
        DetailStoreMixin.factory(
            new DetailLoader({model: 'result'}),
            'hash',
            ResultActions
        )
    ],
    listenables: [ResultActions],
    load: function (state) {
        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            ResultActions.loadSuccess(data);
        }, state);
    },
    init(){
        this.__missing=[];
    },
    onDeleteResult(hash){
        ResultActions.deleteDetail.triggerPromise(hash).then(
            (result) => {
                this.load(this.__current);
            }
        );
    }
});
