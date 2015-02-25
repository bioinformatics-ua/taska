'use strict';
window.$ = window.jQuery = require('jquery');

import jquery from 'jquery';
import React from 'react';
import Router from 'react-router';
import routes from './routes.jsx';
import bootstrap from 'bootstrap';

const content = document.getElementById('playground');

Router.run(routes, Router.HistoryLocation, (Handler) => {
    return React.render(<Handler/>, content);
});
