'use strict';
import Reflux from 'reflux';
import HistoryActions from '../actions/HistoryActions.jsx';

export default Reflux.createStore({
    listenables: [HistoryActions],

    init: function () {
        this.__history = [];
        this.__page = 0;
        this.__page_size = 5;
        this.__max_page = 0;
        this.__count = 0;
    },
    onLoadSuccess: function (data, page = 0) {
        this.__history = $.merge(this.__history, data.results);
        this.__page = page;
        this.__count = data.count;
        this.__max_page = Math.ceil(this.__count / this.__page_size);

        this.trigger();
    },
    getHistory: function(){
        return this.__history;
    },
    getPage: function(){
        return this.__page;
    },
    getPageSize: function(){
        return this.__page_size;
    },
    getMaxPage: function(){
        return this.__max_page;
    }
});
