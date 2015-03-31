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

class SimpleTask extends Task{
    detailRender(){
        return React.createClass({
            render(){
                return (<span>
                    Im so simple!!
                </span>);
            }
        })
    }
}

export default SimpleTask;
