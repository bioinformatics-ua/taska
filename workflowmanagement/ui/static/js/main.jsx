'use strict';
window.$ = window.jQuery = require('jquery');

import jquery from 'jquery';
import React from 'react';
import Router from 'react-router';
import routes from './routes.jsx';
import bootstrap from 'bootstrap';

import {Login} from './actions/api.jsx';
import UserActions from './actions/UserActions.jsx';
import UserStore from './stores/UserStore.jsx';

import StateActions from './actions/StateActions.jsx';

const content = document.getElementById('playground');
const lgn = new Login({});

Router.run(routes, Router.HistoryLocation, (Handler) => {
    UserActions.loadUser((user_data) => {

        console.log('render page');
        React.render(<Handler />, content);
    });
});


