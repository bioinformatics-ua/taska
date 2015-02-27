'use strict';
import Reflux from 'reflux';
import WorkflowActions from '../actions/WorkflowActions.jsx';

import {TableStoreMixin} from '../mixins/store.jsx';

export default Reflux.createStore({
    mixins: [TableStoreMixin],
    listenables: [WorkflowActions]
});
