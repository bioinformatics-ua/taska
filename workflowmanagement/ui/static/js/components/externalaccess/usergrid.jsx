'use strict';
import Reflux from 'reflux';
import React from 'react';
import Griddle from 'griddle-react';

const ExternalUserTable = React.createClass({
    //tableAction: WorkflowActions.load,
    //tableStore: WorkflowStore,
    //mixins: [Reflux.listenTo(WorkflowStore, 'update'), TableComponentMixin],
    getInitialState: function() {
        return {};
    },
    update: function(data){
        this.setState(this.getState());
    },
  render: function () {
    const columnMeta = [];
    return  <div className="panel panel-default panel-overflow griddle-pad">
              <div className="panel-heading">
                <i className="fa fa-sitemap pull-left"></i>
                <h3 className="text-center panel-title"> Users</h3>
               </div>
        {/*<Griddle
                  noDataMessage={<center>You don't have user to select.</center>}
                  {...this.commonTableSettings(false)}
                  columns={["title", "owner_repr", "hash"]}
                  columnMetadata={columnMeta} />*/}
            </div>;
  }
});

export default {ExternalUserTable};