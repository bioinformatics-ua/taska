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
        return {
            study: undefined,
            allStudies: [{ value: 'one', label: 'One' },
	                     { value: 'two', label: 'Two' }]
        };
    },
    update: function (data) {
        this.setState(this.getState());
    },
    selectStudy(){

    },
    render: function () {
        console.log(this.state);
        return <span>
            <Select placeholder="Search for users to reassigning"
                    onChange={this.selectStudy}
                    value={this.state.study}
                    name="form-field-name"
                    options={this.state.allStudies}/>
        </span>;
    }
});

export default {SpecialWorkflowTable};