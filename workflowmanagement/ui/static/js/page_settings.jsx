'use strict';


const getTableSize = function () {
    var body = document.body,
        html = document.documentElement;

    var height = (Math.max( body.scrollHeight, body.offsetHeight,
                            html.clientHeight, html.scrollHeight, html.offsetHeight )-90)*0.93; //Try to change 90 for variables
    return height;
}

const getContentTableSize = function () {
    return getTableSize()-125; //Try to change this 125 for variables
}

export default {getTableSize, getContentTableSize};