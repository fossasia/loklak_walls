'use strict';

var controllersModule = require('./_index');

function StatisticsCtrl($http, $stateParams) { // jshint ignore:line
  var vm = this;
  vm.statuses = [];
  
  // SOCKET.IO INIT - Poll once then listen for socket event
  var url = '/api/tweets/' + $stateParams.user + $stateParams.id;
  $http.get(url).then(
  	function(res){
	  	if (vm.statuses.length <= 0) {
		    // get subset of res.data tweet array if current array is empty
		    // vm.statuses = res.data.splice(0, searchParams.count);
		    vm.statuses = res.data.statuses;
		} else {
			vm.statuses = [];
		}
	}, 
	function(err){ console.log("error",err); }
  );
}

controllersModule.controller('StatisticsCtrl', ['$http', '$stateParams', StatisticsCtrl]);