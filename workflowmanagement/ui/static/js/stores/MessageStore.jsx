'use strict';
import Reflux from 'reflux';
import MessageActions from '../actions/MessageActions.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';
import {ListLoader, DetailLoader} from '../actions/api.jsx'

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
    init(){
        this.__detaildata = {
            user: UserStore.getUser().id,
            allUsers: [],
            message: "",
            title: ""
        };
    },
    onCalibrate(object, hash){
        this.init();

        //I need to create this like a string to avoid change the api.jsx in actions dir
        let params = "object=" + object + "&hash=" + hash ;

        this.onMethodDetail('getUsers',
                            null,
                            'GET', params)
            .then(
            (result) => {
                let map = result.results.map(
                                        entry => {
                                            return {
                                                value: ''+entry.id,
                                                label: entry.fullname
                                            }
                                        }
                            );

                this.__detaildata.allUsers = map;

                this.trigger();
            }
        );

    },
    getMessage(){
        return this.__detaildata;
    },
    getUsers(){
        return this.__detaildata.allUsers;
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
        //this.trigger();
    },
    onSetMessage(message){
        this.__detaildata.message=message;
        //this.trigger();
    },
    onSetObjectType(obj, hash){
        this.__detaildata.object_type=obj;
        this.__detaildata.hash = hash;
        this.trigger();
    },
    onSetReceivers(receivers){
        this.__detaildata.receiver = receivers;
        //this.trigger();
    },
    onSend(){
        let msg = $.extend({}, this.__detaildata);

        if(msg.receiver == undefined)
            msg.receiver = [];

        if(msg.title != "" && msg.message != ""){
            StateActions.loadingStart();

            MessageActions.addDetail.triggerPromise(msg).then(
                        (request) => {
                            this.__rfinished = request;
                            this.__detaildata={};
                            StateActions.loadingEnd();
                            this.trigger();
                        }
                );


        }

    }
});
