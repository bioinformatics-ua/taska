'use strict';
import Reflux from 'reflux';
import ResourceActions from '../actions/ResourceActions.jsx';

import {TableStoreMixin, DetailStoreMixin, ListStoreMixin} from '../mixins/store.jsx';
import {ListLoader, SimpleListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'resource'});

import StateActions from '../actions/StateActions.jsx';

import UserStore from './UserStore.jsx';

export default Reflux.createStore({
    mixins: [TableStoreMixin,
        DetailStoreMixin.factory(
            new DetailLoader({model: 'resource'}),
            'hash',
            ResourceActions
        )
    ],
    listenables: [ResourceActions],
    resetDetail(params){
        this.__detaildata = {
        };
    },
    init(){
        this.__comments = [];
        this.__newcomment = undefined;
    },
    getComments(hash){
        return this.__comments[hash];
    },
    onLoadComments(hash){
        this.onMethodDetail('comment', hash).then(
            (result) => {
                this.__comments[hash] = result.comments;
                this.trigger();
            }
        );
    },
    onSetNewComment(content){
        this.__newcomment=content;
    },
    getNewComment(content){
        return this.__newcomment;
    },
    onSendNewComment(hash){
        if(this.__newcomment && this.__newcomment.trim() != '' && this.__newcomment.length > 2 && hash){
            this.onMethodDetail('comment', hash, 'POST', {
                'comment': this.__newcomment
            }).then(
                (result) => {
                    if(this.__comments[hash].length == 0){
                        this.__comments[hash] = [result.comment];
                    }
                    else {
                        this.__comments[hash].unshift(result.comment);
                    }
                    console.log(hash);
                    console.log(result);
                    console.log(this.__comments);
                    this.trigger();
                }
            );
        } else {
            StateActions.alert({
                'title': 'Comment must have content',
                'message': 'The new comment for a file must have more than 2 letters.'
            })
        }
    }
});
