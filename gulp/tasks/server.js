'use strict';

var config  = require('../config');
var http    = require('http');
var express = require('express');
var session = require('express-session')
var gulp    = require('gulp');
var gutil   = require('gulp-util');
var morgan  = require('morgan');
var flash    = require('connect-flash');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var MongoStore = require('connect-mongo')(session);

require('../../mongo/models/db');
require('../../mongo/config/passport');

var routesApi = require('../../mongo/routes/index');

gulp.task('server', function() {

  var server = express();
  var dbURI = 'mongodb://localhost/test';
  if (process.env.NODE_ENV === 'production') {
    dbURI = process.env.MONGOLAB_URI;
  }

  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(cookieParser());

  server.use(session({
    store: new MongoStore({
      url: dbURI
    }),
    secret: "somescrert",
    resave: true,
    saveUninitialized: true,

  }));

  // Initialise Passport before using the route middleware
  server.use(passport.initialize());
  server.use(passport.session());
  server.use(flash());


  // Use the API routes when path starts with /api
  server.use('/api', routesApi);

  // Uncomment to log all requests to the console
  server.use(morgan('dev'));
  server.use(express.static(config.dist.root));

  // Serve index.html for all other routes to leave routing up to Angular
  server.use('/*', function(req, res) {
    res.sendFile('index.html', { root: 'build' });
  });

  // Start webserver if not already running
  var s = http.createServer(server);
  s.on('error', function(err){
    if(err.code === 'EADDRINUSE'){
      gutil.log('Development server is already started at port ' + config.serverport);
    }
    else {
      throw err;
    }
  });

  s.listen(process.env.PORT || config.serverport);

});