import Reflux from 'reflux';

import React from 'react';

import Uploader from './reusable/uploader.jsx'

import moment from 'moment';

import {stateColor} from '../map.jsx';

const ProcessResume = React.createClass({
    process(){
        return this.props.context.props.detail.Process.process;
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
              <div style={stateColor(task)} className="panel-heading">{task.task_repr}</div>
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
        let tasks = this.process().tasks;

        return tasks.map(task => this.__renderTask(task));
    },
    render(){
        let process = this.process();

        console.log(process);

        return (
        <span>
            <h3>Study Outputs by Task</h3>
            {this.renderTasks()}
        </span>
        );
    }
});

export default {ProcessResume};
