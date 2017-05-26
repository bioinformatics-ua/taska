'use strict';
import {ProcessStatus} from '../../reusable/component.jsx'
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import {TableComponentMixin} from '../../../mixins/component.jsx';

import {getTableSizeWithTabs} from '../../../page_settings.jsx';

import Tabs from 'react-simpletabs';

import moment from 'moment';

const ProcessProgress = React.createClass({
  render: function(){
    const row = this.props.rowData;
    return <center><div className="progress progressbar-process">
              <div className="progress-bar progress-bar-success progress-bar-striped" role="progressbar"
                aria-valuenow={row.progress} aria-valuemin="0"
                aria-valuemax="100" style={{width: `${row.progress}%`}}>
                <span className="sr-only">{row.progress}% Complete</span>
              </div>
            </div></center>;
  }
});

const ProcessStatusDetail = React.createClass({
  render: function(){
    const row = this.props.rowData;
    const object = {object: row.hash}

      return(<small>
                <ProcessStatus rowData={this.props.rowData} />
                </small>);
  }
});

const ProcessLink = React.createClass({
  render: function(){
    const row = this.props.rowData;
    let object;
    if(!this.props.rowData.owner)
        object = {object: row.hash + '/showOnly'};
    else
        object = {object: row.hash};

    return <small>
            <Link to="Process" params={object}>{row.title || row.object_repr}</Link>
           </small>;
  }
});

const ProcessLinkDetail = React.createClass({
    render: function () {
        const row = this.props.rowData;
        const object = {object: row.hash}
        return this.props.rowData.owner ? <small>
                    <Link to="StatusDetail" params={object}>Show assignees</Link>
                </small>:<span></span>;
    }
});

const ProcessLinkRequests = React.createClass({
    render: function () {
        const row = this.props.rowData;
        const object = {object: row.hash}
        return this.props.rowData.owner ? <small>
                    <Link to="StudyRequests" params={object}>Show requests</Link>
                </small>:<span></span>;
    }
});

const ProcessLinkSendMessage = React.createClass({
    render: function () {
        const row = this.props.rowData;
        return this.props.rowData.owner ? <small>
                    <Link to="MessageSender" params={{hash: row.hash, object: 'process'}}>
                        <i className="fa fa-envelope"></i> Messages
                    </Link>
                </small>:<span></span>;
    }
});






export default {ProcessLink, ProcessProgress, ProcessStatusDetail, ProcessLinkDetail, ProcessLinkRequests, ProcessLinkSendMessage}