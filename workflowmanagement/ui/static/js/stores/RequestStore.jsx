'use strict';
import Reflux from 'reflux';
import RequestActions from '../actions/RequestActions.jsx';

import {TableStoreMixin} from '../mixins/store.jsx';

export default Reflux.createStore({
    mixins: [TableStoreMixin],
    listenables: [RequestActions]
});
