'use strict';

import Reflux from 'reflux';

import React from 'react';

import Uploader from './reusable/uploader.jsx';

import moment from 'moment';

const TaskDependencies = React.createClass({
    resources(){
        return this.props.context.state.task.processtask.parent.resources;
    },
    deps(){
        return this.props.context.state.task.dependencies;
    },
    translateOwn(resources){
        let files = [];

        for(let resource of resources){
            if(resource.type === 'material.File')
                files.push({
                    hash: resource.hash,
                    filename: resource.filename,
                    size: resource.size,
                    creator: resource['creator_repr'],
                    date: moment(resource['create_date']).fromNow(),
                    status: 'Finished',
                    progress: 100,
                    manage: ''
                });
        }

        return files;
    },
    translateResources(users){
        let files = [];

        for(let user of users){
            if(user.result){
                let resources = user.result.outputs;
                for(let resource of resources){
                    if(resource.type === 'material.File')
                        files.push({
                            hash: resource.hash,
                            filename: resource.filename,
                            size: resource.size,
                            creator: resource['creator_repr'],
                            date: moment(resource['create_date']).fromNow(),
                            status: 'Finished',
                            progress: 100,
                            manage: ''
                        });
                }
            }

        }

        return files;

    },
    __renderTask(task){
        let resources = this.translateResources(task.users);
        return (
            <div    key={`resumeTaskPanel${task.hash}`}
                    className="panel panel-default"
                >
              <div className="panel-heading">{task.task_repr}</div>
                {resources.length == 0? (
                    <div className="panel-body">
                        <center>There are no output resources for this task</center>
                    </div>
                ):(
                <div style={{marginBottom: '-20px'}}>
                <Uploader
                    editable={false}
                    extraFields={['date', 'creator']}
                    uploads={resources}
                />
                </div>)}
            </div>
            );
    },
    renderTasks(){
        let tasks = this.deps();

        return tasks.map(task => this.__renderTask(task));
    },
    render(){
        let resources = this.translateOwn(this.resources());

        return(
        <span>
            <h3>Task Resources</h3>
            <Uploader
                    editable={false}
                    extraFields={['date', 'creator']}
                    uploads={resources}
                />

            <h3>Inputs From Dependencies</h3>
            {this.renderTasks()}
        </span>);
    }
});

export default {TaskDependencies};
