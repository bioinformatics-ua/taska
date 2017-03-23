'use strict';
import Reflux from 'reflux';
import React from 'react';
import Griddle from 'griddle-react';

import UserGridStore from '../../stores/UserGridStore.jsx';
import UserGridActions from '../../actions/UserGridActions.jsx';

import {TableComponentMixin} from '../../mixins/component.jsx';

const ExternalUserTable = React.createClass({
    tableAction: UserGridActions.load,
    tableStore: UserGridStore,
    mixins: [Reflux.listenTo(UserGridStore, 'update'), TableComponentMixin],
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
            <Griddle
                  noDataMessage={<center>You don't have user to select.</center>}
                  {...this.commonTableSettings(false)}
                  columns={["user"]}
                  columnMetadata={columnMeta} />
            </div>;
  }
});

export default {ExternalUserTable};