/* globals PRICER */

var  calc = require('./calc');

PRICER.applicationController = (function() {
    'use strict';
    function start() {
        calc('test');
    }

    return {
        start: start
    };
}());
