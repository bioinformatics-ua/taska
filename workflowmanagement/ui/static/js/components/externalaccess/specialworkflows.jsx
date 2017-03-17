'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import ExternalActions from '../../actions/ExternalActions.jsx';
import ExternalStore from '../../stores/ExternalStore.jsx';

import Select from 'react-select';

import {WorkflowOwner, WorkflowLink, WorkflowManage} from '../reusable/workflows/components.jsx';
import {TableComponentMixin} from '../../mixins/component.jsx';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';


const SpecialWorkflowTable = React.createClass({
    getInitialState: function () {
        return {};
    },
    update: function (data) {
        this.setState(this.getState());
    },
    render: function () {

        return <span></span>;
    }
});

export default {SpecialWorkflowTable};