'use strict';
import Reflux from 'reflux';
import FormActions from '../actions/FormActions.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'form'});

import StateActions from '../actions/StateActions.jsx';

import UserStore from './UserStore.jsx';

export default Reflux.createStore({
    mixins: [TableStoreMixin,
        DetailStoreMixin.factory(
            new DetailLoader({model: 'form'}),
            'hash',
            FormActions
        )
    ],
    listenables: [FormActions],
    load: function (state) {
        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            FormActions.loadSuccess(data);
        }, state);
    },
    onCalibrate(){
    },
    resetDetail(params){
        this.__detaildata = {
        };
    },
    getFormAddFinished(){
        return this.__rfinished || false;
    },
    onSetTitle(title){
        this.__detaildata.title=title;
        this.trigger();
    },
    onSubmitForm(){
        let sForm = $.extend({}, this.__detaildata);

        if(sForm.title != ""){
            StateActions.loadingStart();

            if(sForm.hash){
                FormActions.postDetail.triggerPromise(sForm.hash, sForm).then(
                        (form) => {
                            StateActions.loadingEnd();
                            this.trigger();
                        }
                );
            } else {
                FormActions.addDetail.triggerPromise(sForm).then(
                        (form) => {
                            StateActions.loadingEnd();
                            this.__rfinished = form;
                            this.trigger();
                        }
                );
            }

        }
    }
});
