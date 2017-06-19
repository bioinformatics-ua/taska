 'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import {Modal, Affix} from './reusable/component.jsx';

import FormActions from '../actions/FormActions.jsx';

import FormStore from '../stores/FormStore.jsx';

import UserStore from '../stores/UserStore.jsx';

import Select from 'react-select';

import Toggle from 'react-toggle';

export default React.createClass({
    mixins: [   Router.Navigation,
                Authentication,
                Reflux.listenTo(FormStore, 'update')],
    statics: {
        fetch(params) {
            if(params.object == 'add'){
                return new Promise(function (fulfill, reject){
                    FormStore.resetDetail(params);
                    fulfill({});
                });
            }
            return FormActions.loadDetailIfNecessary.triggerPromise(params.object).then(
                (Form) => {
                    return Form;
                }
            );
        }
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    displayName: route => {
        try {
            if(route.props.detail.FormAdd)
                return `Add Form`;
            else
                return `Form - ${route.props.detail.Form.title}`;
        } catch(ex){
            return "Form Not Found";
        }
    },
    __getState(){
        return {
            form: FormStore.getDetail(),
            user: UserStore.getUser(),
            addedform: FormStore.getFormAddFinished()
        };
    },
    getInitialState(){
        return this.__getState();
    },
    componentWillMount(){
        FormActions.calibrate();
    },
    componentDidMount(){
        window.formHash = this.state.form.hash;

        let fb = new Formbuilder({
            selector: '#form_manager',
            bootstrapData: this.state.form.schema
        });
        fb.on('save', function(payload){
            FormActions.setSchema(payload);
        });
    },
    componentDidUpdate(){
        if(this.state.addedform){
            this.context.router.transitionTo('Form', {object: this.state.addedform.hash, headless: this.props.headless})
        }
    },
    update(status){
        this.setState(this.__getState());
    },
    setTitle(e){
        FormActions.setTitle(e.target.value);
    },
    isMe(){
        // TODO
        return true;
    },
    didWrite(){
        // TODO
        return true;
    },

    setForm(){
        FormActions.submitForm();
    },

    render() {
        if(this.props.failed){
            let Failed = this.props.failed;
            return <Failed />;
        }

        return (
            <div className="form-detail row">
                <div className="col-md-12">
                    <div className="panel panel-default">
                        <div className="panel-body">
                            <div className="row">
                                <div className="col-md-9">
                                      <div className="form-group">
                                        <div className="input-group">
                                          <span className="input-group-addon"><strong>Title</strong></span>
                                          <input disabled={!this.didWrite()} onChange={this.setTitle} className="form-control" value={this.state.form.title}/>
                                        </div>
                                      </div>
                                </div>
                                <div className="col-md-3 save_container">
                                        {this.didWrite()?
                                            <Affix key={'form_savebar'} className={'savebar'} clamp={'.save_container'} fill={false} offset={40}>
                                                <button onClick={this.setForm} className="btn btn-primary btn-block btn-default">
                                                    <i style={{marginTop: '3px'}} className="pull-left fa fa-floppy-o"></i> Save Form
                                                </button>
                                            </Affix>
                                        :''}
                                </div>
                            </div>
                            <span>
                            <div className="form-group row">
                                <div className="col-md-6">
                                </div>
                                <div className="col-md-6">
                                </div>
                            </div>
                            <div className="row">
                                <div>
                                    <div id="form_manager"></div>
                                </div>
                            </div>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

