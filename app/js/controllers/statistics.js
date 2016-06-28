'use strict';

var controllersModule = require('./_index');

function StatisticsCtrl($http, $stateParams, AnalyticService, socket) { // jshint ignore:line
	var stats = this;
	stats.statuses = [];
	stats.hashtagfreq = [];
	stats.hashtagDateFreq = [];
	stats.userId = $stateParams.user;
	stats.wallId = $stateParams.id;

	// SOCKET.IO INIT - Poll once then listen for socket event
	var url = '/api/tweets/' + $stateParams.user + $stateParams.id;
	$http.get(url).then(
		function(res){
			stats.statuses = res.data.statuses;
			if(!stats.statuses.length) {
				console.log("no new tweets");
			} else {
			// AnalyticService.updateWordFreq(newTweets);
			// AnalyticService.updateMentionFreq(newTweets);

			// process all for hashtagfreq

			AnalyticService.updateHashtagDateFreq(stats, stats.statuses, 7);
			console.log(stats)
	   		}
		}, 
		function(err){ console.log("error",err); }
	);

    socket.on('addNewTweets' + $stateParams.user + $stateParams.id, function(tweetArr){
    	console.log("adding new tweet", tweetArr[0])
        stats.statuses.splice(0,0,tweetArr[0]);
        AnalyticService.updateHashtagDateFreq(stats, stats.statuses, 7);

    })

}

controllersModule.controller('StatisticsCtrl', ['$http', '$stateParams', 'AnalyticService', 'socket', StatisticsCtrl]);