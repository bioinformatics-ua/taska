'use strict';
import Reflux from 'reflux';
import RejectedTaskActions from '../actions/RejectedTaskActions.jsx';
import StateActions from '../actions/StateActions.jsx';
import ResultActions from '../actions/ResultActions.jsx';

import ResultStore from './ResultStore.jsx';

import {depmap} from '../map.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'process/my/rejectedtasks'});

export default Reflux.createStore({
    statics: {
        DETAIL: 0,
        LIST: 1
    },
    mixins: [TableStoreMixin, Reflux.connect(ResultStore, "dummy"),
        DetailStoreMixin.factory(
            new DetailLoader({model: 'process/my/rejectedtask'}),
            'hash',
            RejectedTaskActions
        )
    ],
    listenables: [RejectedTaskActions],
    load: function (state) {
        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            RejectedTaskActions.loadSuccess(data);
        }, state);
    },
    dummy(s){},
    init(){
        this.answer = {};
        this.dversion = 0;

    },
    onPreliminary(hash){
        StateActions.alert(
        {
            'title':'Update Preliminary Results',
            'message': 'This will allow preview of incomplete results for scheduled task dependencies. Are you sure you want to generate preview results ?',
            onConfirm: (context)=>{
                StateActions.loadingStart();

                console.log(hash);

                this.onMethodDetail('preliminary_outputs', hash)
                    .then(
                    (data) => {
                        StateActions.loadingEnd();
                        StateActions.dismissAlert();

                        StateActions.alert({
                            'title':'Preliminary Results Requested',
                            'message': 'Preliminary results have been requested, and will be briefly available.'
                        });

                        this.dversion++;
                        this.trigger(this.DETAIL, true);
                    }
                );
            }
        });
    },
    getDepVersion(){
        return this.dversion;
    }
});