'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function linearApproveLayoutDirective() {
    	// toggle: '&',

  return {
    scope: {
    	data: '=',
    },
    templateUrl: 'wall/templates/linear-approve.html',
    controller: ['$scope', '$http', function($scope, $http) {

    	$scope.toggle = function(id){
    		console.log(id);
    		$scope.data.approval = !$scope.data.approval;
    		$http.put('/api/tweets/'+id, $scope.data);
    	}


    }]

  };

}

directivesModule.directive('linearApprove', linearApproveLayoutDirective);