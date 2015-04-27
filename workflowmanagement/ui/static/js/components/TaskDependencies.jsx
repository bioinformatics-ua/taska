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
                            task: user.result.processtaskuser.processtask.parent.title,
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
        return this.translateResources(task.users);
        return (
                <Uploader
                    editable={false}
                    extraFields={['date', 'creator', 'task']}
                    uploads={resources}
                />);
    },
    renderTasks(){
        let tasks = this.deps();

        let resources = tasks.reduce(
            (array, task) =>
                $.extend(array, this.__renderTask(task))
            ,[]
        );
        return (
            <div key={`resumeDependencyPanel`}
                    className="panel panel-default"
                >
                {resources.length == 0? (
                    <div className="panel-body">
                        <center>There are no output resources for this task dependencies</center>
                    </div>
                ):(
                <div style={{marginBottom: '-20px'}}>
                <Uploader
                    editable={false}
                    extraFields={['date', 'creator', 'task']}
                    uploads={resources}
                />
                </div>)}
            </div>
            );

    },
    render(){
        let resources = this.translateOwn(this.resources());

        return(
        <span>
            <h3>Task Resources</h3>
            <div key={`resumeTaskPanel`}
                    className="panel panel-default"
            >
                <div className="panel-body">
                    <Uploader
                            editable={false}
                            extraFields={['date', 'creator']}
                            uploads={resources}
                        />
                </div>
            </div>

            <h3>Input Resources From Dependencies</h3>
            {this.renderTasks()}
        </span>);
    }
});

export default {TaskDependencies};
