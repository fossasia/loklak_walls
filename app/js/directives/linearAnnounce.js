'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function linearAnnounceLayoutDirective() {

  return {
    scope: {
    	data: '=',
    },
    templateUrl: 'wall/templates/linear-announce.html',
    controller: ['$scope', '$http', function($scope, $http) {

    	$scope.deleteAnnounce = function(){
    		
    	}
    }]

  };

}

directivesModule.directive('linearAnnounce', linearAnnounceLayoutDirective);