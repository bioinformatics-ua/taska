'use strict';
window.$ = window.jQuery = require('jquery');

import jquery from 'jquery';
import React from 'react';
import Router from 'react-router';
import routes from './routes.jsx';
import bootstrap from 'bootstrap';

import {Login} from './actions/api.jsx';

const content = document.getElementById('playground');


// For each route, if the route specifies a fetch function, treat it as an async-data needy route
function fetch(routes, params) {
    let data = {};
    return Promise.all(routes
        .filter(route => route.handler.fetch)
        .map(route => {
            return route.handler.fetch(params).then(d => {data[route.name] = d;});
        })
    ).then(() => data);
}

Router.run(routes, Router.HistoryLocation, (Handler, state) => {
    fetch(state.routes, state.params).then((detail) => {
        console.log('DATA HERE:');
        console.log(detail);
        React.render(<Handler detail={detail.Workflow} />, content);
    });
});


