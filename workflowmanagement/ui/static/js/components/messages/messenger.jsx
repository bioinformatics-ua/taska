'use strict';
import React from 'react';
import Router from 'react-router';
import MessageCreator from './MessageCreator.jsx';
import MessagesTable from './MessagesTables.jsx';

import {Authentication} from '../../mixins/component.jsx';

export default React.createClass({
    mixins: [ Router.Navigation,  Authentication],
    getStudyHash(){
        return this.context.router.getCurrentParams().hash;
    },
    render(){
        return <span>
                    <div>
                        <div className="row">
                            <div className="col-md-12">
                                <MessagesTable hash={this.getStudyHash()}/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <MessageCreator />
                            </div>
                        </div>
                    </div>
               </span>;
    }
});