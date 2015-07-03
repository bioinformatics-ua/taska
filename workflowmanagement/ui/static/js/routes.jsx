'use strict';

import React from 'react';
import {Route, DefaultRoute, NotFoundRoute} from 'react-router';

import {Label} from './components/reusable/component.jsx';

// Base url must come from django to be dynamic (i realize this breaks the isolation a bit...)
var baseurl = $('#baseurl').attr('href');

if(baseurl.length > 1 && baseurl[baseurl.length-1] == '/'){
    baseurl = baseurl.substring(0, baseurl.length - 1);
}
console.log(baseurl)

module.exports = (
    <Route name='app' path={baseurl} handler={require('./components/app.jsx')}>
        <Route name="default" path={baseurl} handler={require('./components/home.jsx')}/>

        <Route name="login" path="login" handler={require('./components/login.jsx')}/>

        <Route name="register" path="register" handler={require('./components/register.jsx')}/>

        <Route name="activate" path="activate/:email" handler={require('./components/activate.jsx')}/>


        <Route name="profile" path="profile" handler={require('./components/profile.jsx')}/>

        <Route name="home" path={baseurl} handler={require('./components/home.jsx')}/>

        <Route name="help" handler={require('./components/help.jsx')} />

        <Route name="about" handler={require('./components/about.jsx')} />

        <Route name="Workflow" path="workflow/:object" handler={require('./components/workflow.jsx')} >
            <Route name="WorkflowEdit" path=":mode" handler={Label} />
        </Route>

        <Route name="Process" path="process/:object" handler={require('./components/process.jsx')}>
            <Route name="ProcessEdit" path=":mode" handler={Label} />
        </Route>

        <Route name="Request" path="request/:object" handler={require('./components/request.jsx')}>
        </Route>

        <Route name="Form" path="form/:object/?:headless?" handler={require('./components/form.jsx')}>
        </Route>

        <Route name="RequestAdd" path="request/:object/:process/:task/?:default?" handler={require('./components/request.jsx')}>
        </Route>

        <Route name="SimpleResult" path="simpleresult/:object" handler={require('./components/task/simple.jsx')} />
        <Route name="result.SimpleResult" path="simpleresult/:object" handler={require('./components/task/simple.jsx')} />

        <Route name="tasks.SimpleTask" path="simpletask/:object" handler={require('./components/task/simple.jsx')} />
        <Route name="SimpleTask" path="simpleresult/:object" handler={require('./components/task/simple.jsx')} />

        <Route name="FormResult" path="formresult/:object" handler={require('./components/task/form.jsx')} />
        <Route name="form.FormResult" path="formresult/:object" handler={require('./components/task/form.jsx')} />

        <Route name="form.FormTask" path="formtask/:object" handler={require('./components/task/form.jsx')} />
        <Route name="FormTask" path="formresult/:object" handler={require('./components/task/form.jsx')} />



        <Route name="ConnectionRefused" path="/0" handler={require('./components/0.jsx')}/>
        <Route name="InternalError" path="/500" handler={require('./components/500.jsx')}/>

        <NotFoundRoute name="NotFound" handler={require('./components/404.jsx')}/>
    </Route>
);
