import Reflux from 'reflux';

import React from 'react';

import Uploader from './reusable/uploader.jsx'

import moment from 'moment';

import {stateColor} from '../map.jsx';

import Tabs from 'react-simpletabs';
import Griddle from 'griddle-react';

import {DetailHistoryTable} from './reusable/history.jsx';

const ProcessResume = React.createClass({
    process(){
        return this.props.context.props.detail.Process.process;
    },

    translateResources(task){
        let files = [];
        for(let user of task.users){
            if(user.result){
                let resources = user.result.outputs;

                for(let resource of resources){
                    if(resource.type === 'material.File')
                        files.push({
                            hash: resource.hash,
                            filename: resource.filename,
                            size: resource.size,
                            creator: resource['creator_repr'],
                            task: task['task_repr'],
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
        return this.translateResources(task);
    },
    renderTasks(){
        let tasks = this.process().tasks;

        //return tasks.map(task => this.__renderTask(task));
        let resources = tasks.reduce(
            (array, task) =>{
                let mergeresult =  $.merge(array, this.__renderTask(task));
                return mergeresult;
            }
            ,[]
        );
        return <Uploader
                editable={false}
                extraFields={['date', 'creator', 'task']}
                uploads={resources}
            />
    },
    render(){
        let process = this.process();

        return (
        <span>
            <Tabs tabActive={1}>
                <Tabs.Panel title={<span><i className="fa fa-file-o"></i> Outputs by Task</span>}>
                    {this.renderTasks()}
                </Tabs.Panel>
                <Tabs.Panel title={<span><i className="fa fa-list-alt"></i> Log</span>}>
                    <DetailHistoryTable hash={`process/${this.process().hash}`} />
                </Tabs.Panel>
            </Tabs>
        </span>
        );
    }
});

export default {ProcessResume};
