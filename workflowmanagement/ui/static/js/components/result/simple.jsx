'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Authentication} from '../../mixins/component.jsx';

import {Modal, PermissionsBar} from '../reusable/component.jsx';

import ResultActions from '../../actions/ResultActions.jsx';

import ResultStore from '../../stores/ResultStore.jsx';

import Result from '../result.jsx'

class SimpleResult extends Result{
    getTypeRepr(){
        return <span><i className='fa fa-check'></i> Simple Result</span>;
    }
    detailResultRender(){
        const context = this;
        return React.createClass({
            render(){
                return (<span>
                    BOTTOM
                </span>);
            }
        })
    }
}

export default SimpleResult;
