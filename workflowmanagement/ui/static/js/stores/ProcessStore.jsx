'use strict';
import Reflux from 'reflux';
import ProcessActions from '../actions/ProcessActions.jsx';

import {TableStoreMixin} from '../mixins/store.jsx';

export default Reflux.createStore({
    mixins: [TableStoreMixin],
    listenables: [ProcessActions]
});
