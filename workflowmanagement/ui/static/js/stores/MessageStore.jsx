'use strict';
import Reflux from 'reflux';
import MessageActions from '../actions/MessageActions.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'message'});

import StateActions from '../actions/StateActions.jsx';

import UserStore from './UserStore.jsx';

export default Reflux.createStore({
   mixins: [TableStoreMixin,
        DetailStoreMixin.factory(
            new DetailLoader({model: 'message'}),
            'hash',
            MessageActions
        ),
    ],
    listenables: [MessageActions],
    load: function (state) {
        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            MessageActions.loadSuccess(data);
        }, state);
    },
    resetDetail(params){
        this.__detaildata = {
            user: UserStore.getUser().id,
        }

        if(params.default){
            this.__detaildata.type = params.default;
        }

        this.__rfinished = undefined;
    },
    onSetTitle(title){
        this.__detaildata.title=title;
        this.trigger();
    },
    onSetMessage(message){
        this.__detaildata.message=message;
        this.trigger();
    },
    onSend(){
        let srequest = $.extend({}, this.__detaildata);
        delete srequest['response'];

        if(srequest.title != "" && srequest.message != "" && srequest.type != ""){
            StateActions.loadingStart();

            if(srequest.hash){
                MessageActions.postDetail.triggerPromise(srequest.hash, srequest).then(
                        (request) => {
                            StateActions.loadingEnd();
                            this.trigger();
                        }
                );
            } else {
                MessageActions.addDetail.triggerPromise(srequest).then(
                        (request) => {
                            StateActions.loadingEnd();
                            this.__rfinished = request;
                            this.trigger();
                        }
                );
            }

        }
    }
});
