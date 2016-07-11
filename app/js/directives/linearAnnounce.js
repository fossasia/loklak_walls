'use strict';

var directivesModule = require('./_index.js');
var moment = require('moment');

/**
 * @ngInject
 */
function linearAnnounceLayoutDirective() {

  return {
    scope: {
    	data: '=',
        editAnnounce: '&',
        deleteAnnounce: '&',
    },
    templateUrl: 'wall/templates/linear-announce.html',
    controller: ['$scope', '$http', function($scope, $http) {
        $scope.moment = moment;
    }]

  };

}

directivesModule.directive('linearAnnounce', linearAnnounceLayoutDirective);