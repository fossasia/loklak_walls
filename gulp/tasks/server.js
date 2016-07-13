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
var fileParser = require('connect-multiparty')();
var cloudinary = require('cloudinary');
var fs = require('fs');

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
  var pollingWalls = {};
  var clientIds = {};

  io.on('connection', function (socket) {
    console.log("connected");
    clientIds[socket.id] = [];
    
    // UserwallId room when start poll
    socket.on('create', function(userWallId) {
      socket.join(userWallId);
    });

    // Check duplicate, start if no one else polling
    socket.on('checkDup', function(data){
      var clients_in_the_room = io.sockets.adapter.rooms[data.userWallId]; 
      var isNoOneElsePolling = pollingWalls[data.userWallId] === socket.id || !pollingWalls[data.userWallId];
      console.log("pollingwalls", pollingWalls)
      console.log("clientIds", clientIds)
      console.log("checkDup", clients_in_the_room)
      if(clients_in_the_room){
        var result = clients_in_the_room.length === 1 || isNoOneElsePolling;
        var responseEmit = 'checkDupSuccess'+ data.userWallId+ data.socketId;
        socket.emit(responseEmit, result);
      }
    })

    // Start polling and mark poller 
    // Pre-cond: no one else polling / previous poller leaves
    socket.on('addPollingWalls', function(userWallId){
      pollingWalls[userWallId] = socket.id;
      var clientWalls = clientIds[socket.id];
      if(clientWalls.indexOf(userWallId) === -1){
        clientWalls.push(userWallId);
      }
    })

    // Leave and remove wallId so that another poll can pass
    socket.on('disconnect', function() {
      console.log("disconnect")
      var clientWallPoll = clientIds[socket.id];
      clientWallPoll.forEach(function(wallId){
        pollingWalls[wallId] = null;
      })
      delete clientIds[socket.id];
    })
  });

  module.exports = io;

  var routesApi = require('../../mongo/routes/index');

  // Use the API routes when path starts with /api
  server.use('/api', routesApi);

  // Cloudinary image uploads
  cloudinary.config({ 
    cloud_name: config.cloudinaryName, 
    api_key: config.cloudinaryAPIKey, 
    api_secret: config.cloudinaryAPISecret 
  });

  server.use('/upload', fileParser, function(req, res){
    var imageFile = req.files.image;
    cloudinary.uploader.upload(imageFile.path, function(result){
      if (result.url) {
        console.log(result);
        res.json({public_id: result.public_id});
      } else {
        console.log('Error uploading to cloudinary: ',result);
        res.json({msg:'did not get url'});
      }
    });
  });

  // Serve index.html for all other routes to leave routing up to Angular
  server.use('/*', function(req, res) {
    res.sendFile('index.html', { root: 'build' });
  });

});