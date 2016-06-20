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


gulp.task('server', function() {

  var server = express();
  var dbURI = 'mongodb://localhost/test';
  if (process.env.NODE_ENV === 'production') {
    dbURI = process.env.MONGODB_URI;
  }

  server.use(bodyParser.json({limit:"50mb"}));
  server.use(bodyParser.urlencoded({ limit:"50mb", extended: false }));
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

  // Uncomment to log all requests to the console
  server.use(morgan('dev'));
  server.use(express.static(config.dist.root));

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
  var io = require('socket.io')(s);
  io.on('connection', function (socket) {
    console.log("connected")
  });
  module.exports = io;

  var routesApi = require('../../mongo/routes/index');
  

  // Use the API routes when path starts with /api
  server.use('/api', routesApi);

  // Serve index.html for all other routes to leave routing up to Angular
  server.use('/*', function(req, res) {
    res.sendFile('index.html', { root: 'build' });
  });


});