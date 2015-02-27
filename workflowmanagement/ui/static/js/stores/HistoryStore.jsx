'use strict';
import Reflux from 'reflux';
import HistoryActions from '../actions/HistoryActions.jsx';
import {TableStoreMixin} from '../mixins/store.jsx';

export default Reflux.createStore({
    merge: true,
    mixins: [TableStoreMixin],
    listenables: [HistoryActions],
});
