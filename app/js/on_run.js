'use strict';
/* jshint unused:false */
/* global angular */

/**
 * @ngInject
 */
 function OnRun($rootScope, $location, AppSettings, HelloService, AuthService, MailService, $http, SweetAlert, $state) {
   var root = {};
   root.hello = HelloService;
   
  /**
   * UI related root variables
   *
   */
   root.globalSearchTerm = '';
   root.topNavItems = [
   {
     'title': 'Home',
     'link' : '/',
     'icon' : 'fa fa-home'
   },
   {
     'title': 'Wall',
     'link' : '/wall',
     'icon' : 'fa fa-list'
   },
   {
     'title': 'Report',
     'link' : '/report',
     'icon' : 'fa fa-bar-chart'
   }        
   ];

   root.fullscreenDisabled = true;
   root.sidebarEnabled = false;

   $rootScope.modPostPromise=null;

   $rootScope.$on('cfpLoadingBar:started', function() {
    angular.element('#loklak-nav-logo').hide();
  });

   $rootScope.$on('cfpLoadingBar:completed', function() {
    angular.element('#loklak-nav-logo').show();
  });

  $rootScope.modPostPromise; // For cancelling the $interval polling

    // check if authenticated
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
  
      if (toState.authenticate || toState.verify ){
          // User isn’t authenticated
          AuthService.currentUser().success(function(data){
            if(toState.verify && !data.isVerified){
              $state.transitionTo("Home");
              SweetAlert.alert("Not verified", {
                title: 'User not verified',
                text: 'To create walls, you must click the verification link in the email of account you used to sign up.',
                type: 'error',
                showCancelButton: true,
                confirmButtonColor:"#607d8b",
                confirmButtonText:"Send Confirmation Email",
                cancelButtonText:"Cancel",
              }).then(function(response){
                if(response){
                  MailService.sendConfirmation(data.local.email);
                } else {
                  console.log("exit");
                }
              })
            }else if(!data._id){
              $state.transitionTo("Home");
              SweetAlert.alert("Error", "Please log in.")
              event.preventDefault();
            }

      });

      } 
    });

    // change page title based on state
    $rootScope.$on('$stateChangeSuccess', function(event, toState) {
      var pageTitle = 'Loklak ';
      if ( toState.title ) {
        pageTitle += toState.title;
        $rootScope.root.currentView = toState.title;
      }
      $rootScope.root.pageTitle = pageTitle;
    });

    $rootScope.root = root;
       $rootScope.root.loginForm = true;

    $http.get('/api/currentuser').success(function(data){
      if(data._id){
        $rootScope.root.currentUser = data;
        $rootScope.root.isLoggedIn = true;
      } else {
        $rootScope.root.currentUser = {};
        $rootScope.root.isLoggedIn = false;
      }
    });

    $rootScope.root.user = {
      email : "",
      password : ""
    };
    
    $rootScope.root.login = function () {
      $http.post('/api/login', {
        email: $rootScope.root.user.email,
        password: $rootScope.root.user.password
      }).success(function(data) {
        console.log(data);
        $rootScope.root.isLoggedIn = true;
        $rootScope.root.currentUser = data;
        $location.path('/profile');
      }).error(function() {
          SweetAlert.alert("Please try again", {title: "Error Logging In!"});
      });

    };

    $rootScope.root.register = function(){
      $http.post('/api/register', {
        email: $rootScope.root.user.email,
        password: $rootScope.root.user.password
      }).success(function(data) {
        if(!data.message){
          $rootScope.root.isLoggedIn = true;
          $rootScope.root.currentUser = data;
          SweetAlert.success("Registered!", {
            title: "User registered",
            text: "Check email for verification",
          });
          MailService.sendConfirmation($rootScope.root.user.email);
        } else {
          $rootScope.root.isLoggedIn = false;
          $rootScope.root.currentUser = null;
        }
      }).error(function() {
          SweetAlert.alert("Please try again", {title: "Error Signing Up!"});
      });

    };

    $rootScope.root.onLogout = function () {

      $http.get('/api/logout')
      .success(function() {
        $location.path('/');
        $rootScope.root.isLoggedIn = false;
        $rootScope.root.currentUser = {};
      })
      .error(function() {
          SweetAlert.alert("Please try again", {title: "Logout Failed!"});
      });
    };

}
module.exports = OnRun;