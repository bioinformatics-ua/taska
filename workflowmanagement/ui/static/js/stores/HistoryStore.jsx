'use strict';
import Reflux from 'reflux';
import HistoryActions from '../actions/HistoryActions.jsx';

export default Reflux.createStore({
    listenables: [HistoryActions],

    onLoadSuccess: function (data) {
        this.trigger({entries: data});
    }
});
