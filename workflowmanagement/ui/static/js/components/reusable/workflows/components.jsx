'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import WorkflowActions from '../../../actions/WorkflowActions.jsx';
import WorkflowStore from '../../../stores/WorkflowStore.jsx';

import Griddle from 'griddle-react';

import {Loading, DeleteButton} from '../component.jsx'
import {TableComponentMixin} from '../../../mixins/component.jsx';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';

const WorkflowManage = React.createClass({
    delete(row){
        WorkflowActions.deleteWorkflow(row.hash);
    },
    render: function () {
        const user = this.props.metadata.user;
        const row = this.props.rowData;
        const object = {object: row.hash, mode: 'edit'};
        const object2 = {object: row.hash, mode: 'run'};
        return <div className="pull-right" role="group" aria-label="...">
            <div className="user-owned">{user && user.id === row.owner ?
                <i title="You are the creator of this Study Template, and are authorized to edit it."
                   className="fa fa-2x fa-user"></i>
                : ''}</div>
            <Link className="btn btn-sm btn-default" to="Workflow"
                  params={object2}><i className="fa fa-search"></i></Link>
        </div>;
    }
});

const WorkflowLink = React.createClass({
    render: function () {
        const row = this.props.rowData;
        const object = {object: row.hash}
        return <small>
            <Link to="Workflow" params={object}>{row.title}</Link>
        </small>;
    }
});

const WorkflowOwner = React.createClass({
    render: function () {
        const row = this.props.rowData;
        return <small>
            {row['owner_repr']}
        </small>;
    }
});

export {WorkflowOwner, WorkflowLink, WorkflowManage};