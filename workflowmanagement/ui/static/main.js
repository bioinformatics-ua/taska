'use strict';
window.$ = window.jQuery = require('jquery');
require('es5-shim');
var React = require('react');
var bootstrap = require('bootstrap');

React.render(
    React.createElement('h1', null, 'Hello, world!'),
    document.getElementById('playground')
);
