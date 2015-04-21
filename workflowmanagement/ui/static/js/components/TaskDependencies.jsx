'use strict';

import Reflux from 'reflux';

import React from 'react';

import Uploader from './reusable/uploader.jsx';

import moment from 'moment';

const TaskDependencies = React.createClass({
    resources(){
        return this.props.context.state.task.processtask.parent.resources;
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
        </span>);
    }
});

export default {TaskDependencies};
