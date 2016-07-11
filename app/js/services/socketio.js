'use strict';

var servicesModule = require('./_index.js');
/**
 * @ngInject
 */
function socketio($rootScope, AuthService) {

  var socket = io.connect();

  return {

    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    },

    getId: function(){
      return socket.id;
    },

    removeListener: function(eventName, cb){
      socket.removeListener(eventName, function(){
        cb()
      })
    },

    removeAllListeners: function (eventName, data, callback) {
      socket.removeAllListeners();
    }


  };

};

servicesModule.factory('socket',['$rootScope', 'AuthService', socketio]);

