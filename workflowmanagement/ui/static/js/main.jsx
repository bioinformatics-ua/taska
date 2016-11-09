'use strict';

window.$ = window.jQuery = require('jquery');

window._ = window.underscore = require('underscore');

window.Backbone = require('backbone');

window.Backbone.DeepModel = require('backbone-deep-model');

window.Backbone.$ = window.$;

window.rivets = require('rivets');

require('babelify/polyfill');

import React from 'react';
import Router from 'react-router';
import routes from './routes.jsx';
import bootstrap from 'bootstrap';

import jqueryui from 'jquery-ui';

import touchpunch from 'jquery-ui-touch-punch';

import {Login} from './actions/api.jsx';

import StateActions from './actions/StateActions.jsx';

import Http404 from './components/statuscodes/404.jsx';
import Http500 from './components/statuscodes/500.jsx';

import Http0 from './components/statuscodes/0.jsx';

const content = document.getElementById('playground');

/*require('./vendor/dobtco-formbuilder-vendor');
window.FormBuilder = require('./vendor/formbuilder-min');
window.FormRenderer = require('./vendor/formrenderer');*/

// For each route, if the route specifies a fetch function, treat it as an async-data needy route
function fetch(routes, params) {
    let data = {};
    return Promise.all(routes
        .filter(route => route.handler.fetch)
        .map(route => {

            return route.handler.fetch(params, route)
                        .then(d => {data[route.name] = d;});
        })
    ).then(() => data);
}

Router.run(routes, Router.HistoryLocation, (Handler, state) => {
    StateActions.loadingStart();
    fetch(state.routes, state.params).then((detail) => {
        React.render(<Handler detail={detail} />, content);
        StateActions.loadingEnd();
    }); /*.catch(
        (ex) => {
            console.log(ex);

            Raven.captureException(ex);
            if(ex.status === 404){
                React.render(<Handler failed={Http404} />, content);
                StateActions.loadingEnd();
            } else if(ex.status === 0){
                React.render(<Handler failed={Http0} />, content);
                StateActions.loadingEnd();
            } else {
                React.render(<Handler failed={Http500} />, content);
                StateActions.loadingEnd();
            }
        }
    )*/
});


