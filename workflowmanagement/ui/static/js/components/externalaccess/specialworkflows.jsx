'use strict';
import Reflux from 'reflux';
import React from 'react';
import Router from 'react-router';
import {RouteHandler, Link} from 'react-router';

import {Authentication} from '../../mixins/component.jsx';

import ExternalActions from '../../actions/ExternalActions.jsx';
import ExternalStore from '../../stores/ExternalStore.jsx';

import Select from 'react-select';

import {WorkflowOwner, WorkflowLink, WorkflowManage} from '../reusable/workflows/components.jsx';
import {TableComponentMixin} from '../../mixins/component.jsx';
import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';


const SpecialWorkflowTable = React.createClass({
    mixins: [   Router.Navigation,
                Authentication,
                Reflux.listenTo(ExternalStore, 'update')],
    statics: {
        fetch(params) {
            return new Promise(function (fulfill, reject){
                ExternalStore.init();
                fulfill({});
            });
        }
    },
    getState: function () {
        return {
            study: undefined,
            allStudies: ExternalStore.getTemplates()
        };
    },
    getInitialState(){
        return this.getState();
    },
    componentWillMount(){
        ExternalActions.calibrate();
    },
    update: function (data) {
        this.setState(this.getState());
    },
    selectStudy(e){
        this.setState({study: e});
        this.props.setStudyTemplate(e);
    },
    render: function () {
        return <div className="input-group reassign">
            <Select placeholder="Search for users to reassigning"
                    onChange={this.selectStudy}
                    value={this.state.study}
                    name="form-field-name"
                    options={this.state.allStudies}/>
        </div>;
    }
});

export default {SpecialWorkflowTable};