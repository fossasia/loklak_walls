'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function linearApproveLayoutDirective() {

  return {
    scope: {
    	data: '=',
    },
    templateUrl: 'wall/templates/linear-approve.html',
    controller: ['$scope', '$http', function($scope, $http) {

    	$scope.toggle = function(){
    		console.log($scope.data);
    		$scope.data.approval = !$scope.data.approval;
    		$http.put('/api/tweets/'+$scope.data._id, $scope.data);
    	}


    }]

  };

}

directivesModule.directive('linearApprove', linearApproveLayoutDirective);