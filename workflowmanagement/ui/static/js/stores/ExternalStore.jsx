'use strict';
import Reflux from 'reflux';
import ExternalActions from '../actions/ExternalActions.jsx';

import ResultStore from './ResultStore.jsx';

import {depmap} from '../map.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx'

let workflowLoader = new ListLoader({model: 'workflow/external/montra'});

export default Reflux.createStore({
    statics: {
        DETAIL: 0,
        LIST: 1
    },
    mixins: [TableStoreMixin, Reflux.connect(ResultStore, "dummy"),
        DetailStoreMixin.factory(
            new DetailLoader({model: 'workflow/external/montra'}),
            'hash',
            ExternalActions
        )
    ],
    listenables: [ExternalActions],
    load: function (state) {
        let self = this;
        workflowLoader.load(function(data){
            self.updatePaginator(state);
            ExternalActions.loadSuccess(data);
        }, state);
    },
    dummy(s){},
    init(){
        this.__detaildata = {
            studyTemplates: []
        };

    },
    onCalibrate(){
        this.init();

        this.onMethodDetail('',
                            null,
                            'GET')
            .then(
            (result) => {
                let map = result.results.map(
                                        entry => {
                                            console.log(entry);
                                            return {
                                                value: entry.hash,
                                                label: entry.title
                                            }
                                        }
                            );

                this.__detaildata.studyTemplates = map;

                this.trigger();
            }
        );
    },
    getTemplates(){
        return this.__detaildata.studyTemplates;
    }
});
