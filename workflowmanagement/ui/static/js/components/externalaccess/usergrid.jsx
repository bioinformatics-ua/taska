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
    componentWillMount(){
        UserGridActions.calibrate();
    },
    getInitialState: function () {
        return {};
    },
    update: function (data) {
        this.setState(this.getState());
    },
    addNewUser(){
      console.log("AAAAAAAADDDDDDDDDDDDDDD");
    },
    render: function () {
        console.log(this.props.ur);

        const columnMeta = [
            {
                "columnName": "firstName",
                "order": 1,
                "locked": false,
                "visible": true,
                //"customComponent": ProcessLink,
                //"cssClassName": "mystudies-process-title-td",
                "displayName": "First name"
            },
            {
                "columnName": "lastName",
                "order": 2,
                "locked": false,
                "visible": true,
                //"customComponent": ProcessLink,
                //"cssClassName": "mystudies-process-title-td",
                "displayName": "Last name"
            },
            {
                "columnName": "email",
                "order": 3,
                "locked": false,
                "visible": true,
                //"customComponent": ProcessLink,
                //"cssClassName": "mystudies-process-title-td",
                "displayName": "Email"
            },
        ];
        return <span>

                <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="startdate">
                                    <strong>Email</strong>
                                </span>
                                <input className="form-control" onChange={this.addNewUser} defaultValue={"AAAA"} />
                                <span className="input-group-btn">
                                    <button onClick={this.addNewUser} className="btn btn-success"><i className="fa fa-plus"></i></button>
                                  </span>
                            </div>
                        </div>

            <div className="panel panel-default panel-overflow griddle-pad">
                <div className="panel-heading">
                    <i className="fa fa-sitemap pull-left"></i>
                    <h3 className="text-center panel-title"> Users</h3>
                </div>
                <Griddle
                    noDataMessage={<center>You don't have user to select.</center>}
                    {...this.commonTableSettings(false)}
                    columns={["firstName", "lastName", "email"]}
                    columnMetadata={columnMeta}/>
            </div>
        </span>;
    }
});

export default {ExternalUserTable};