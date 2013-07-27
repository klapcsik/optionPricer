/* globals $, PRICER */
'use strict';


PRICER.applicationController = (function() {
    function start() {
        console.log('Running jQuery %s', $().jquery);
    }

    return {
        start: start
    };
}());


