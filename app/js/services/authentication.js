'use strict';

var servicesModule = require('./_index.js');
/**
 * @ngInject
 */
 function AuthenticationService($http) {

   var isLoggedIn = function() {
     $http.get('/api/currentuser').success(function (data) {
      if(data._id) return true;
      else return false;
    }).
     error(function () {
      return false;
    });
   }

  var currentUser = function() {
     return $http.get('/api/currentuser')
  } 

  var register = function(user) {
    return $http.post('/api/register', user);
  };

  var login = function(user) {
    return $http.post('/api/login', user);

  };

  var logout = function() {
    $http.get('/api/logout');
  };

  var twitterSignUp = function(){
    $http.get('/api/login/twitter');
  }

  return {
    currentUser : currentUser,
    isLoggedIn : isLoggedIn,
    register : register,
    login : login,
    logout : logout,
    twitterSignUp: twitterSignUp
  };
}


servicesModule.service('AuthService',['$http', '$window', AuthenticationService]);

