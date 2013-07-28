'use strict';
// Module dependencies.
var applicationRoot = __dirname,
    express = require( 'express' ), //Web framework
    path = require( 'path' ), //Utilities for dealing with file paths
    fs = require('fs');

//Create server
var app = express();



// Configure server
app.configure( function() {
    //parses request body and populates request.body
    app.use( express.bodyParser() );

    //checks request.body for HTTP method overrides
    app.use( express.methodOverride() );

    // middleware must go above app router
    app.use(function(req, res, next) {
        var oneof = false;
        if(req.headers.origin) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
            oneof = true;
        }
        if(req.headers['access-control-request-method']) {
            res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
            oneof = true;
        }
        if(req.headers['access-control-request-headers']) {
            res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
            oneof = true;
        }
        if(oneof) {
            res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
        }

        // intercept OPTIONS method
        if (oneof && req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
            res.send(200);
        }
        else {
            next();
        }
    });

    //perform route lookup based on url and HTTP method
    app.use( app.router );

    //Where to serve static content
    app.use( express.static( path.join( applicationRoot, 'app') ) );

    //Show all errors in development
    app.use( express.errorHandler({ dumpExceptions: true, showStack: true }));


    // Routes
    app.get( '/api', function( request, response ) {
        response.send('get /api');
    });

    //Get a list of all photos
    app.get( '/api/resources', function( request, response ) {
        var resources = {js: '', css: ''};
        var jsFilePaths = [
            '../app/build/bundle.js',
            '../app/components/hogan.js/web/builds/2.0.0/hogan-2.0.0.js',
            '../app/build/templates/compiled.js'
        ];
        var cssFilePaths = ['../.tmp/styles/main.css'];
        var resourceCounter = 0;
        var requiredResources = jsFilePaths.length + cssFilePaths.length;

        for (var i = 0; i < jsFilePaths.length; i++) {
            fs.readFile(jsFilePaths[i], 'utf8', function (err,data) {
                if (err) {
                    console.log('error ' + data + jsFilePaths[i]);
                } else {
                    resources.js = resources.js + data;
                }
                addResources();
            });
        }

        for (var j = 0; j < cssFilePaths.length; j++) {
            fs.readFile(cssFilePaths[j], 'utf8', function (err,data) {
                if (err) {
                    console.log('error ' + data);
                } else {
                    resources.css = resources.css + data;
                }
                addResources();
            });    
        }

        function addResources() {
            resourceCounter = resourceCounter + 1;
            console.log(resourceCounter + ' out of ' + requiredResources);
            if (resourceCounter === requiredResources) {
                response.send(resources);
            }
        }

    });
});


//Start server
var port = 4711;
app.listen( port, function() {
    console.log( 'Express server listening on port %d in %s mode', port, app.settings.env );
});

