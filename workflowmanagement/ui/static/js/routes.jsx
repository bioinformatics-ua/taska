'use strict';

import React from 'react';
import {Route, DefaultRoute, NotFoundRoute} from 'react-router';

module.exports = (
    <Route name='app' path='/' handler={require('./components/app.jsx')}>
        <Route name="home" path="/" handler={require('./components/home.jsx')}/>

        <Route name="about" handler={require('./components/about.jsx')} />

        <NotFoundRoute handler={require('./components/404.jsx')}/>
    </Route>
);
