'use strict';
// Module dependencies.
var applicationRoot = __dirname,
    express = require( 'express' ), //Web framework
    path = require( 'path' ), //Utilities for dealing with file paths
    fs = require('fs'),
    http = require('http');
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
    app.use('/app', express.static( path.join( applicationRoot, '../' ,'app') ));

    //Show all errors in development
    app.use( express.errorHandler({ dumpExceptions: true, showStack: true }));


    // Routes
    app.get( '/api', function( request, response ) {
        response.send('get /api');
    });

    app.get( '/api/riskfreerate/:curr/:daysInFuture', function( request, response ) {
        // http://data.treasury.gov/feed.svc/DailyTreasuryYieldCurveRateData?$filter=month(NEW_DATE)%20eq%208%20and%20year(NEW_DATE)%20eq%202013
        // GBP from http://markets.ft.com/research/Markets/Bonds
        var daysInFuture = parseInt(request.params.daysInFuture, 10);
        var currency = request.params.curr;
        var rates = {
            usd: {
                0: 0,
                30: 0.02,
                91: 0.04,
                182: 0.08,
                365: 0.13,
                730: 0.35
            },
            gbp: {
                0: 0,
                30: 0.29,
                91: 0.36,
                182: 0.38,
                365: 0.35,
                730: 0.34
            }
        };

        // interpolate
        var prev = 0;
        for(var days in rates[currency]) {
            if(rates[currency].hasOwnProperty(days)) {
                if (daysInFuture <= days && daysInFuture >= prev ) {
                    var rate = rates[currency][prev] + ((rates[currency][days]-rates[currency][prev])/(days - prev))*(daysInFuture-prev);
                    response.send({rate: rate, date: '2013-08-02'});
                }
                prev = days;
            }
        }
    });

    //Get a list of all photos
    app.get( '/api/resources', function( request, response ) {
        var resources = {js: '', css: ''};
        var jsFilePaths = [
            'build/bundle.js',
            'components/hogan.js/web/builds/2.0.0/hogan-2.0.0.js',
            'build/templates/compiled.js'
        ];
        var cssFilePaths = ['styles/main.css', '../.tmp/styles/main.css'];
        var resourceCounter = 0;
        var requiredResources = jsFilePaths.length + cssFilePaths.length;

        for (var i = 0; i < jsFilePaths.length; i++) {
            var filePath = path.join( applicationRoot, '../' ,'app', jsFilePaths[i]);
            console.log(filePath);
            fs.readFile(filePath, 'utf8', function (err,data) {
                if (err) {
                    console.log('js error ' + data + jsFilePaths[i]);
                } else {
                    resources.js = resources.js + data;
                }
                addResources();
            });
        }

        for (var j = 0; j < cssFilePaths.length; j++) {
            var cssFilePath;
            // HACK: hack to deal with files being compiled to .tmp in dev but not in prod
            if (cssFilePaths[0] !== '.') {
                cssFilePath = path.join( applicationRoot, '../' ,'app', cssFilePaths[j]);
            } else {
                cssFilePath = cssFilePaths[j];
            }
            console.log(cssFilePath);
            fs.readFile(cssFilePath, 'utf8', function (err,data) {
                if (err) {
                    console.log('css error ' + data);
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
var port =  process.env.PORT || 4711;
app.listen( port, function() {
    console.log( 'Express server listening on port %d in %s mode', port, app.settings.env );
});

