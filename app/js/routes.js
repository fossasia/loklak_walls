'use strict';

/**
 * @ngInject
 */
 function Routes($stateProvider, $locationProvider, $urlRouterProvider, $httpProvider, cfpLoadingBarProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider
  .state('Home', {
    url: '/',
    controller: 'MapCtrl as map',
    templateUrl: 'home.html',
    title: 'Home'
  })
  .state('profile', {
    url: '/profile',
    controller: 'ProfileCtrl as profile',
    templateUrl: 'profile.html',
    title: 'Profile',
    authenticate: true
  })
  .state('About', {
    url: '/about',
    templateUrl: 'about.html',
    title: 'About Loklak Twitter Evaluation'
  })
  .state('Search', {
    url: '/search?q&timezoneOffset',
    templateUrl: 'search.html',
    controller: 'SearchCtrl as search',
    title: 'Search',
    reloadOnSearch: false
  })
  .state('Advanced', {
    url: '/advancedsearch?q',
    templateUrl: 'advancedsearch.html',
    controller: 'AdvancedSearchCtrl as advanced',
    title: 'AdvancedSearch',
    reloadOnSearch: false
  })
  .state('Wall', {
    url: '/walls',
    templateUrl: 'wall/create.html',
    controller: 'WallCtrl as wall',
    title: 'Wall',
    verify: true
  })
  // // wall creation modal is ng-included in create.html
  // .state('WallCreate', {
  //   url: '/wall/create',
  //   templateUrl: 'wall/create.html',
  //   controller: 'WallCtrl as wall',
  //   title: 'Wall'
  // })
.state('WallDisplay', {
  url: '/:user/wall/:id',
  templateUrl: 'wall/display.html',
  controller: 'WallDisplay as wall',
  title: 'Wall',
  onEnter: ['$rootScope',function($rootScope){$rootScope.root.fullscreenDisabled=false;}],
  onExit: ['$rootScope',function($rootScope){$rootScope.root.fullscreenDisabled=true;}]
})
.state('StatisticsDisplay', {
  url: '/:user/statistics/:id',
  templateUrl: 'wall/statistics.html',
  controller: 'StatisticsCtrl as stats',
  title: 'Statistics'
})
.state('StatisticsBubble', {
  url: '/:user/bubbles/:id',
  templateUrl: 'wall/bubbles.html',
  controller: 'BubbleCtrl as stats',
  title: 'BubbleChart'
})
// .state('Statistics', {
//   url: '/statistics?q&since&until',
//   controller: 'StatisticsCtrl as statistics',
//   templateUrl: 'statistics.html',
//   title: 'Statistics'
// })
.state('SingleTweet', {
  url: '/tweet?q',
  controller: 'SingleTweetCtrl as singleTweet',
  templateUrl: 'single-tweet.html',
  title: 'SingleTweet'
})
.state('Topology', {
  url: '/topology?screen_name',
  templateUrl: 'topology.html',
  controller: 'TopologyCtrl as topology',
  title: 'Topology'
})
.state('DataConnect', {
  url: '/connect',
  templateUrl: 'data-connect/data-connect.html',
  controller: 'DataConnectCtrl as dataConnect',
  title: 'My Connections'
})
.state('DataConnectWSourceType', {
  url: '/connect/:source_type',
  templateUrl: 'data-connect/data-connect.html',
  controller: 'DataConnectCtrl as dataConnect',
  title: 'My Connections'
})
.state('Report', {
  url: '/report',
  templateUrl: 'analyze/analyze.html',
  controller: 'AnalyzeCtrl as Analyze',
  title: 'Analyze Data'
})
.state('Redirecting', {
  url: '/redirect',
  templateUrl: 'redirect.html',
  title: 'Redirecting',
  onEnter: ['$rootScope',function($rootScope){$rootScope.root.fullscreenDisabled=false;}],
  onExit: ['$rootScope',function($rootScope){$rootScope.root.fullscreenDisabled=true;}]
});

  $urlRouterProvider.otherwise('/');

  cfpLoadingBarProvider.includeBar = false;
  cfpLoadingBarProvider.includeSpinner = true;

  //token injector http interceptor
  $httpProvider.interceptors.push('tokenInjector'); 

}

module.exports = ['$stateProvider', '$locationProvider', '$urlRouterProvider', '$httpProvider', 'cfpLoadingBarProvider', Routes];