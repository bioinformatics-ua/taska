'use strict';
import {RouteHandler, Link, Router} from 'react-router';
import React from 'react/addons';
import Reflux from 'reflux';
import Griddle from 'griddle-react';

import {Authentication} from '../../mixins/component.jsx';
import {TableComponentMixin} from '../../mixins/component.jsx';

import RequestByProcessActions from '../../actions/RequestByProcessActions.jsx';
import RequestByProcessStore from '../../stores/RequestByProcessStore.jsx';
import UserStore from '../../stores/UserStore.jsx';

import {Loading} from '../reusable/component.jsx'
import {RequestDate, RequestUser, RequestLink, RequestStatus} from './reusable/request.jsx'

export default React.createClass({
    displayName: "My Studies",
    mixins: [Authentication],
    render: function () {
        return <LoggedInHome />;
    }
});

const LoggedInHome = React.createClass({
    __getState(){
        return {
            user: UserStore.getUser()
        }
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    getInitialState(){
        return this.__getState();
    },
    render: function () {
        let params = this.context.router.getCurrentParams();
        return (<span>
                      <div className="row flex-container">
                          <div className="col-md-6 flex-container flex-row">
                              <RequestTable hash={params.object} />
                          </div>
                      </div>
                  </span>);
    }
})

const RequestTable = React.createClass({
    tableAction: RequestByProcessActions.load,
    tableStore: RequestByProcessStore,
    mixins: [Reflux.listenTo(RequestByProcessStore, 'update'), TableComponentMixin],
    getInitialState: function () {
        return {};
    },
    update: function (data) {
        this.setState(this.getState());
    },
    render: function () {
        const columnMeta = [
            {
                "columnName": "title",
                "order": 1,
                "locked": true,
                "visible": true,
                "customComponent": RequestLink,
                "displayName": "Title"
            },
            {
                "columnName": "processtaskuser",
                "order": 2,
                "locked": true,
                "visible": true,
                "customComponent": RequestUser,
                "displayName": "User"
            },
            {
                "columnName": "date",
                "order": 3,
                "locked": true,
                "visible": true,
                "displayName": "Date",
                "customComponent": RequestDate
            },
            {
                "columnName": "type",
                "order": 4,
                "locked": true,
                "visible": true,
                "customComponent": RequestStatus,
                "cssClassName": "request-td",
                "displayName": "Type"
            }
        ];
        return <div className="panel panel-default panel-overflow  griddle-pad">
                    <div className="panel-heading">
                        <i className="fa fa-life-ring pull-left"></i>
                        <h3 className="text-center panel-title">Received Requests</h3>
                        <Link style={{position: 'absolute', right: '10px', top: '7px', zIndex: 1002}}
                              to="MessageSender"
                              params={{hash: this.props.hash, object: 'process'}}
                              className="pull-right btn btn-xs btn-success">
                             <i className="fa fa-envelope"></i> Send mail to all users
                        </Link>
                      </div>
                    <Griddle
                        noDataMessage={<center>You currently have no requests made by assignees, relating to this study process.</center>}
                        {...this.commonTableSettings(false)}
                        columns={["title", "processtaskuser",  "date","type"]}
                        columnMetadata={columnMeta}/>
                </div>;
    }

});