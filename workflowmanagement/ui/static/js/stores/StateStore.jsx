'use strict';
import Reflux from 'reflux';
import StateActions from '../actions/StateActions.jsx';

export default Reflux.createStore({
    listenables: [StateActions],
    init: function () {
        this.__loading = false;
    },

    isLoading: function(){
        return this.__loading;
    },

    // Action handlers
    onLoadingStart: function(){
        console.log('loading');
        this.__loading = true;
        this.trigger();
    },
    onLoadingEnd: function(){
        console.log('finished loading');
        this.__loading = false;
        this.trigger();
    }
});
