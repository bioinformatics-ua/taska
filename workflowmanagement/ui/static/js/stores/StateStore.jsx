'use strict';
import Reflux from 'reflux';
import StateActions from '../actions/StateActions.jsx';

import Queue from 'queue.js';


export default Reflux.createStore({
    listenables: [StateActions],
    init: function () {
        this.__loading = false;
        this.__alert_queue = new Queue();
        this.__unsaved = false;
    },

    isLoading: function(){
        return this.__loading;
    },
    isUnsaved: function(){
        return this.__unsaved;
    },
    onWaitSave: function(){
        if(!this.__unsaved){
            this.__unsaved = true;
            this.trigger();
        }
    },
    onSave: function(trigger=true, callback){
        this.__unsaved = false;

        if(callback){
            callback();
        }

        if(trigger)
            this.trigger();
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
    onDismissAlert(trigger=true){
        if(this.__alert_queue.length > 0){
            this.__alert_queue.shift();

            if(trigger)
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
