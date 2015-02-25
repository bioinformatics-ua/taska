'use strict';
import Reflux from 'reflux';
// Each action is like an event channel for one specific event. Actions are called by components.
// The store is listening to all actions, and the components in turn are listening to the store.
// Thus the flow is: User interaction -> component calls action -> store reacts and triggers -> components update
const HistoryActions = Reflux.createActions([
    'loadSuccess',
    'load'
]);

HistoryActions.load.listen(function (page) {
        $.ajax({
          url: `api/history/?page=${page+1}`,
          dataType: 'json',
          success: function(data) {
            HistoryActions.loadSuccess(data, page);

          }.bind(this),
          error: function(xhr, status, err) {
            console.error(status, err.toString());
          }.bind(this)
        });

});

export default HistoryActions;
