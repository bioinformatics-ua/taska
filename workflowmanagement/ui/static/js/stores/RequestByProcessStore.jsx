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
    },
    onCalibrate(){
        this.__response = this.__detaildata.response || {public: false};
        this.trigger();
    },
    resetDetail(params){
        this.__detaildata = {
            process: params.process,
            task: params.task,
            user: UserStore.getUser().id,
            public: false
        }

        if(params.default){
            this.__detaildata.type = params.default;
        }

        this.__rfinished = undefined;
    },
    getResponse(){
        return this.__response || {};
    },
    getRequestAddFinished(){
        return this.__rfinished || false;
    },
    onSetTitle(title){
        this.__response.title=title;
        this.trigger();
    },
    onSetDesc(desc){
        this.__response.message=desc;
        this.trigger();
    },
    onSetReqTitle(title){
        this.__detaildata.title=title;
        this.trigger();
    },
    onSetReqMessage(message){
        this.__detaildata.message=message;
        this.trigger();
    },
    onSetReqType(type){
        this.__detaildata.type=type;
        this.trigger();
    },
    onSetPublic(pub){
        this.__detaildata.public = pub;
        this.trigger();
    },
    onSubmitResponse(make_public=false){
        delete this.__response.request;

        if(this.__response.title != "" && this.__response.message != ""){
            StateActions.loadingStart();

            this.__response.public=make_public;

            console.log(this.__response);

            RequestByProcessActions.postDetail.triggerPromise(this.__detaildata.hash,
                {response: this.__response}).then(
                    (request) => {
                        StateActions.loadingEnd();
                        this.trigger();
                    }
            );
        }
    },
    onSubmitRequest(){
        let srequest = $.extend({}, this.__detaildata);
        delete srequest['response'];

        if(srequest.title != "" && srequest.message != "" && srequest.type != ""){
            StateActions.loadingStart();

            if(srequest.hash){
                RequestByProcessActions.postDetail.triggerPromise(srequest.hash, srequest).then(
                        (request) => {
                            StateActions.loadingEnd();
                            this.trigger();
                        }
                );
            } else {
                RequestByProcessActions.addDetail.triggerPromise(srequest).then(
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