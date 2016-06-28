'use strict';

var controllersModule = require('./_index');

function BubbleCtrl($http, $stateParams, AnalyticService, socket) { // jshint ignore:line
	var stats = this;
	stats.statuses = [];
	stats.hashtagfreq = [];
	stats.hashtagDateFreq = [];
	stats.wordFreq={};
	stats.mentionFreq= {};
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
			AnalyticService.updateWordFreq(stats, res.data.statuses);
			AnalyticService.updateMentionFreq(stats, res.data.statuses);

			// process all for hashtagfreq

			// AnalyticService.updateHashtagDateFreq(stats, stats.statuses, 7);
			// console.log(stats)
	   		}
		}, 
		function(err){ console.log("error",err); }
	);

    socket.on('addNewTweets' + $stateParams.user + $stateParams.id, function(tweetArr){
    	console.log("adding new tweet", tweetArr[0])
        // stats.statuses.splice(0,0,tweetArr[0]);
        // AnalyticService.updateHashtagDateFreq(stats, stats.statuses, 7);
        // var newTweets;
        // if(!stats.statuses || stats.statuses.length === 0){
        // 	newTweets = data;
        // 	stats.statuses = data;
        // } else {
        // 	newTweets = analyticService.getNewTweets(data);
        // 	stats.statuses = newTweets.concat(stats.statuses);
        // }           

        // AnalyticService.updateWordFreq(stats, tweetArr);
        // AnalyticService.updateMentionFreq(stats, tweetArr);

    })

}

controllersModule.controller('BubbleCtrl', ['$http', '$stateParams', 'AnalyticService', 'socket', BubbleCtrl]);