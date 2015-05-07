'use strict';
import Reflux from 'reflux';
import FormActions from '../actions/FormActions.jsx';

import {TableStoreMixin, DetailStoreMixin, ListStoreMixin} from '../mixins/store.jsx';
import {ListLoader, SimpleListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'form'});

import StateActions from '../actions/StateActions.jsx';

import UserStore from './UserStore.jsx';

export default Reflux.createStore({
    mixins: [TableStoreMixin,
        DetailStoreMixin.factory(
            new DetailLoader({model: 'form'}),
            'hash',
            FormActions
        ),
        ListStoreMixin.factory(
            new SimpleListLoader({model: 'form'}),
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
    onSetSchema(schema){
        this.__detaildata.schema=JSON.parse(schema).fields;
        this.trigger();
    },
    onDeleteForm(hash){
        FormActions.deleteDetail.triggerPromise(hash).then(
            (result) => {
                this.load(this.__current);
            }
        );
    },
    onSubmitForm(){
        let sForm = $.extend({}, this.__detaildata);
        let errors = false;

        if(!(sForm.title && sForm.title != "")){
            StateActions.alert(
                {
                    'title': 'Missing Field',
                    'message': 'The form must have a title!'
                });
            errors=true;
        }

        if(!(sForm.schema && sForm.schema.length > 0)){
            StateActions.alert(
                {
                    'title':'Missing Field',
                    'message': 'The form must have a defined schema!'
                });
            errors=true;
        }

        if(!errors){
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
