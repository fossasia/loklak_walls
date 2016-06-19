'use strict';

var servicesModule = require('./_index.js');
/**
 * @ngInject
 */
function socketio($rootScope) {

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

    removeAllListeners: function (eventName, data, callback) {
      socket.removeAllListeners();
    }


  };

};

servicesModule.factory('socket',['$rootScope', socketio]);

