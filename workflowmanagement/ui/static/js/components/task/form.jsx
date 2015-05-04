'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Authentication} from '../../mixins/component.jsx';

import {Modal, PermissionsBar} from '../reusable/component.jsx';

import TaskActions from '../../actions/TaskActions.jsx';

import TaskStore from '../../stores/TaskStore.jsx';

import Task from '../task.jsx'

import Uploader from '../reusable/uploader.jsx'

let fr;

class FormTask extends Task{
    getTypeRepr(){
        return <span><i className='fa fa-check'></i> Simple Task</span>;
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
                    response_fields: [{
                            "label": "Please enter your clearance number",
                            "field_type": "text",
                            "required": true,
                            "field_options": {},
                            "cid": "c6"
                        }, {
                            "label": "Security personnel #82?",
                            "field_type": "radio",
                            "required": true,
                            "field_options": {
                                "options": [{
                                    "label": "Yes",
                                    "checked": false
                                }, {
                                    "label": "No",
                                    "checked": false
                                }],
                                "include_other_option": true
                            },
                            "cid": "c10"
                    }],
                    response: {
                        id: 'xxx',
                        responses: {}
                    }
                };
                fr = new FormRenderer(
                    options
                );

            },
            render(){
                return (<span>
                    <div className="form-group">
                        <div className="input-group">
                          <span className="input-group-addon"><strong>Commentaries</strong></span>
                          <textarea disabled={!editable} rows="4" placeholder="Leave a comment upon task resolution (optional)"
                            value={context.state.answer.comment} onChange={context.changeComment} className="form-control" />
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
