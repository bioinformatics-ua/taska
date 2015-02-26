'use strict';
import Reflux from 'reflux';
import WorkflowActions from '../actions/WorkflowActions.jsx';

import {TableStoreMixin} from '../mixins/TableStoreMixin.jsx';

export default Reflux.createStore({
    mixins: [TableStoreMixin],
    listenables: [WorkflowActions]
});
