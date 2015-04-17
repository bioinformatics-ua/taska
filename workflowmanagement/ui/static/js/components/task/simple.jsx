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

class SimpleTask extends Task{
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

    detailRender(){
        const context = this;
        return React.createClass({
            render(){
                return (<span>
                    <div className="form-group">
                        <div className="input-group">
                          <span className="input-group-addon"><strong>Commentaries</strong></span>
                          <textarea rows="4" placeholder="Leave a comment upon task resolution (optional)"
                            value={context.state.answer.comment} onChange={context.changeComment} className="form-control" />
                        </div>
                    </div>
                    <Uploader uploads={[]} done={context.setResources} />

                </span>);
            }
        })
    }
}

export default SimpleTask;
