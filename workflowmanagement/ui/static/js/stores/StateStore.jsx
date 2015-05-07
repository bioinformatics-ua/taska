'use strict';
import Reflux from 'reflux';
import StateActions from '../actions/StateActions.jsx';

import Queue from 'queue.js';


export default Reflux.createStore({
    listenables: [StateActions],
    init: function () {
        this.__loading = false;
        this.__alert_queue = new Queue();
    },

    isLoading: function(){
        return this.__loading;
    },

    // Action handlers
    onLoadingStart: function(){
        this.__loading = true;
        this.trigger();
    },
    onLoadingEnd: function(){
        this.__loading = false;
        this.trigger();
    },

    onAlert(options){
        this.__alert_queue.push(options);
        this.trigger();
    },
    onDismissAlert(){
        if(this.__alert_queue.length > 0){
            this.__alert_queue.shift();
            this.trigger();
        }
    },
    getAlert(){
        try{
            return this.__alert_queue.head.data;
        } catch(ex){
            return undefined;
        }
    }
});
