'use strict';

var controllersModule = require('./_index');

function StatisticsCtrl($http, $stateParams, AnalyticService, socket) { // jshint ignore:line
	var barChartVm = this;
	barChartVm.statuses = [];
	barChartVm.hashtagfreq = [];
	barChartVm.hashtagDateFreq = [];
	barChartVm.userId = $stateParams.user;
	barChartVm.wallId = $stateParams.id;

	// SOCKET.IO INIT - Poll once then listen for socket event
	var url = '/api/tweets/' + $stateParams.user + $stateParams.id;
	$http.get(url).then(
		function(res){
			barChartVm.statuses = res.data.statuses;
			if(!barChartVm.statuses.length) {
				// console.log("no new tweets");
			} else {
			// AnalyticService.updateWordFreq(newTweets);
			// AnalyticService.updateMentionFreq(newTweets);

			// process all for hashtagfreq

			AnalyticService.updateHashtagDateFreq(barChartVm, barChartVm.statuses, 7);
			// console.log(barChartVm)
	   		}
		}, 
		function(err){ 
			console.log("error",err); 
		}
	);

    socket.on('addNewTweets' + $stateParams.user + $stateParams.id, function(tweetArr){
    	// console.log("adding new tweet", tweetArr[0])
        barChartVm.statuses.splice(0,0,tweetArr[0]);
        AnalyticService.updateHashtagDateFreq(barChartVm, barChartVm.statuses, 7);

    })

}

controllersModule.controller('StatisticsCtrl', ['$http', '$stateParams', 'AnalyticService', 'socket', StatisticsCtrl]);