'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Authentication} from '../../mixins/component.jsx';

import {Modal} from '../reusable/component.jsx';

import TaskActions from '../../actions/TaskActions.jsx';

import TaskStore from '../../stores/TaskStore.jsx';

import Task from '../task.jsx'

import Uploader from '../reusable/uploader.jsx'

let fr;

class FormTask extends Task{
    getTypeRepr(){
        return <span><i className='fa fa-list'></i> Form Task</span>;
    }
    changeComment(e){
        super.setAnswer('comment', e.target.value);
    }

    setResources(all_resources){
        let resources = [];
        let full = all_resources || [];

        for(let resource of full){
            resources.push(resource.hash);
        }
        super.setAnswer('outputswrite', resources);
    }
    translateResources(){
        if(this.state.answer.hash){
            let resources = this.state.answer.outputs;
            let files = [];
            for(let resource of resources){
                if(resource.type === 'material.File')
                    files.push({
                        hash: resource.hash,
                        filename: resource.filename,
                        size: resource.size,
                        status: 'Finished',
                        progress: 100,
                        manage: ''
                    });
            }
            return files;
        }
        return [];
    }
    saveCallback(responses){
        console.log(responses);
        super.setAnswer('answer', responses);
    }
    validate(){
        return fr.validate();
    }
    detailRender(){
        const context = this;
        let editable = super.didWrite();

        return React.createClass({
            componentDidMount(){

                let options = {
                    saveCallback: context.saveCallback,
                    project_id: 1,
                    response_fields: context.state.task.processtask.parent['form_repr'].schema,
                    response: {
                        id: 'xxx',
                        responses: context.state.answer.answer || {}
                    }
                };
                fr = new FormRenderer(
                    options
                );
                if(!editable){
                    let inputs = $('.fr_form input, .fr_form select, .fr_form textarea');
                    inputs.addClass('disabledFrenderer');
                    inputs.prop('disabled', true);
                }
            },
            render(){
                return (<span>
                    <div className="form-group">
                        <div className="input-group">
                          <span className="input-group-addon"><strong>Comments</strong></span>
                          <textarea disabled={!editable} rows="4" placeholder="Leave a comment upon task resolution (optional)"
                            defaultValue={context.state.answer.comment} onChange={context.changeComment} className="form-control" />
                        </div>
                    </div>
                    <h3>File outputs</h3>

                    <Uploader editable={editable} uploads={context.translateResources()} done={context.setResources} />

                    <form data-formrenderer></form>
                </span>);
            }
        })
    }
}

export default FormTask;
