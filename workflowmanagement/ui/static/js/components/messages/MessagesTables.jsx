'use strict';
import React from 'react';
import Reflux from 'reflux';
import Griddle from 'griddle-react';

import {TableComponentMixin} from '../../mixins/component.jsx';
import MessageListActions from '../../actions/MessageListActions.jsx';
import MessageListStore from '../../stores/MessageListStore.jsx';

import {MessageLink} from './TableComponents.jsx';

const MessagesTable = React.createClass({
    tableAction: MessageListActions.load,
    tableStore: MessageListStore,
    mixins: [Reflux.listenTo(MessageListStore, 'update'), TableComponentMixin],
    update: function (data) {
        this.setState(this.getState());
    },
    render(){
        const columnMeta = [
            {
                "columnName": "title",
                "order": 1,
                "locked": false,
                "visible": true,
                "customComponent": MessageLink,
                "displayName": "Title"
            },
            {
                "columnName": "date",
                "order": 2,
                "locked": false,
                "visible": true,
                "cssClassName": "messgae-date-td",
                "displayName": "Date"
            }
        ];

        return <div className="panel panel-default panel-overflow griddle-pad">
                <div style={{zIndex: 0}} className="panel-heading">
                    <i className="fa fa-envelope pull-left"></i>
                    <h3 className="text-center panel-title"> Sent messages</h3>

                </div>
                <Griddle
                    noDataMessage={<center>You have no messages sent in this study.</center>}
                    {...this.commonTableSettings(false)}
                    columns={["title", "date"]}
                    columnMetadata={columnMeta}/>
            </div>;
    }
});

export default MessagesTable;