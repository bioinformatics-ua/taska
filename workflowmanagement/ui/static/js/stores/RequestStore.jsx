'use strict';
import Reflux from 'reflux';
import RequestActions from '../actions/RequestActions.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'process/requests'});

import StateActions from '../actions/StateActions.jsx';

import UserStore from './UserStore.jsx';

export default Reflux.createStore({
    mixins: [TableStoreMixin,
        DetailStoreMixin.factory(
            new DetailLoader({model: 'process/requests'}),
            'hash',
            RequestActions
        )
    ],
    listenables: [RequestActions],
    load: function (state) {
        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            RequestActions.loadSuccess(data);
        }, state);
    },
    onCalibrate(){
        this.__response = this.__detaildata.response || {};
        this.trigger();
    },
    resetDetail(params){
        this.__detaildata = {
            process: params.process,
            task: params.task,
            user: UserStore.getUser().id
        }

        if(params.default){
            this.__detaildata.type = params.default;
        }
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

            RequestActions.postDetail.triggerPromise(this.__detaildata.hash,
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
                RequestActions.postDetail.triggerPromise(srequest.hash, srequest).then(
                        (request) => {
                            StateActions.loadingEnd();
                            this.trigger();
                        }
                );
            } else {
                RequestActions.addDetail.triggerPromise(srequest).then(
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
