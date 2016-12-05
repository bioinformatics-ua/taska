'use strict';


const getTableSizeWithTabs = function () {
    var height = (window.innerHeight-90)*0.92; //Try to change 90 for variables

    return height;
}

const getContentTableSizeWithTabs = function () {
    return getTableSizeWithTabs()-125; //Try to change this 125 for variables
}

const getContentTableSize = function () {
    return getTableSizeWithTabs()-80; //Try to change this 80 for variables
}

const getTASKAVersion = function () {
    return "v2.0.1"
}

export default {getTableSizeWithTabs, getContentTableSizeWithTabs, getContentTableSize, getTASKAVersion};