'use strict';
window.$ = window.jQuery = require('jquery');

require('babelify/polyfill');

import jquery from 'jquery';
import React from 'react';
import Router from 'react-router';
import routes from './routes.jsx';
import bootstrap from 'bootstrap';

import jqueryui from 'jquery-ui';

import touchpunch from 'jquery-ui-touch-punch';

import {Login} from './actions/api.jsx';

import StateActions from './actions/StateActions.jsx';

const content = document.getElementById('playground');


// For each route, if the route specifies a fetch function, treat it as an async-data needy route
function fetch(routes, params) {
    let data = {};
    return Promise.all(routes
        .filter(route => route.handler.fetch)
        .map(route => {
            return route.handler.fetch(params).then(d => {data[route.name] = d;});
        })
    ).then(() => data)
    .catch(
        () => {
            console.log('ERROR');
        }
    );
}

Router.run(routes, Router.HistoryLocation, (Handler, state) => {
    StateActions.loadingStart();
    fetch(state.routes, state.params).then((detail) => {
        React.render(<Handler detail={detail} />, content);
        StateActions.loadingEnd();
    });
});


