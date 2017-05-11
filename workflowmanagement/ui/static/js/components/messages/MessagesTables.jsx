'use strict';
import React from 'react';
import Reflux from 'reflux';
import Griddle from 'griddle-react';
import {MessageLink, MessageActions} from './TableComponents.jsx';

import MessageListActions from '../../actions/MessageListActions.jsx';
import MessageListStore from '../../stores/MessageListStore.jsx';
import {TableComponentMixin} from '../../mixins/component.jsx';

const MessagesTable = React.createClass({
    tableAction: MessageListActions.load,
    tableStore: MessageListStore,
    mixins: [Reflux.listenTo(MessageListStore, 'update'), TableComponentMixin],
    getDefaultProps(){
        return {
            tableSettings:
                {
                    bodyHeight:375,
                    tableClassName: "table table-striped",
                    useGriddleStyles: false,
                    nextClassName: "table-prev",
                    previousClassName: "table-next",
                    sortAscendingComponent: <i className="pull-right fa fa-sort-asc"></i>,
                    sortDescendingComponent: <i className="pull-right fa fa-sort-desc"></i>
                },
        };
    },
    render(){
        const columnMeta = [
            {
                "columnName": "title",
                "order": 1,
                "locked": false,
                "visible": true,
                //"customComponent": MessageLink,
                "displayName": "Title"
            },
            {
                "columnName": "date",
                "order": 2,
                "locked": false,
                "visible": true,
                "displayName": "Date"
            },
           /* {
                "columnName": "reiceiver",
                "order": 3,
                "locked": false,
                "visible": true,
                "displayName": "Receivers"
            },*/
            {
                "columnName": "actions",
                "order": 4,
                "locked": false,
                "visible": true,
                "customComponent": MessageActions,
                "displayName": " "
            },
        ];



        return <div className="panel panel-default panel-overflow griddle-pad">
                <div style={{zIndex: 0}} className="panel-heading">
                    <i className="fa fa-envelope pull-left"></i>
                    <h3 className="text-center panel-title"> Sent messages</h3>

                </div>
                <Griddle
                    noDataMessage={<center>You have no messages sent in this study.</center>}
                    {...this.commonTableSettings(false)}
                    {...this.props.tableSettings}
                    columns={["title", "date", "actions"]}
                    columnMetadata={columnMeta}/>
            </div>;
    }
});

export default MessagesTable;