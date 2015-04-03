'use strict';

import React from 'react';
import {Route, DefaultRoute, NotFoundRoute} from 'react-router';

import {Label} from './components/reusable/component.jsx'

module.exports = (
    <Route name='app' path='/' handler={require('./components/app.jsx')}>

        <Route name="login" path="login" handler={require('./components/login.jsx')}/>

        <Route name="profile" path="profile" handler={require('./components/profile.jsx')}/>

        <Route name="home" path="/" handler={require('./components/home.jsx')}/>

        <Route name="about" handler={require('./components/about.jsx')} />

        <Route name="Workflow" path="workflow/:object" handler={require('./components/workflow.jsx')} >
            <Route name="WorkflowEdit" path=":mode" handler={Label} />
        </Route>

        <Route name="Process" path="process/:object" handler={require('./components/process.jsx')}>
            <Route name="ProcessEdit" path=":mode" handler={Label} />
        </Route>

        <Route name="Request" path="request/:object" handler={require('./components/request.jsx')} />

        <Route name="result.SimpleResult" path="simpleresult/:object" handler={require('./components/result/simple.jsx')} />

        <Route name="tasks.SimpleTask" path="simpletask/:object" handler={require('./components/task/simple.jsx')} />

        <NotFoundRoute handler={require('./components/404.jsx')}/>
    </Route>
);
