'use strict';

var controllersModule = require('./_index');

function BubbleCtrl($http, $stateParams, AnalyticService, socket) { // jshint ignore:line
	var bubblesVm = this;
	bubblesVm.statuses = [];
	bubblesVm.hashtagfreq = [];
	bubblesVm.hashtagDateFreq = [];
	bubblesVm.wordFreq={};
	bubblesVm.mentionFreq= {};
	bubblesVm.userId = $stateParams.user;
	bubblesVm.wallId = $stateParams.id;

	// SOCKET.IO INIT - Poll once then listen for socket event
	var url = '/api/tweets/' + $stateParams.user + $stateParams.id;
	$http.get(url).then(
		function(res){
			bubblesVm.statuses = res.data.statuses;
			if(bubblesVm.statuses.length === 0) {
				console.log("no new tweets");
			} else {
				AnalyticService.updateWordFreq(bubblesVm, res.data.statuses);
				AnalyticService.updateMentionFreq(bubblesVm, res.data.statuses);

			// process all for hashtagfreq

			// AnalyticService.updateHashtagDateFreq(bubblesVm, bubblesVm.statuses, 7);
			// console.log(bubblesVm)
		}
	}, 
	function(err){ console.log("error",err); }
	);

	socket.on('addNewTweets' + $stateParams.user + $stateParams.id, function(tweetArr){
		console.log("adding new tweet", tweetArr[0])
        // bubblesVm.statuses.splice(0,0,tweetArr[0]);
        // AnalyticService.updateHashtagDateFreq(bubblesVm, bubblesVm.statuses, 7);
        // var newTweets;
        // if(!bubblesVm.statuses || bubblesVm.statuses.length === 0){
        // 	newTweets = data;
        // 	bubblesVm.statuses = data;
        // } else {
        // 	var newTweets = analyticService.getNewTweets(data);
    	bubblesVm.statuses = tweetArr.concat(bubblesVm.statuses);
        // }           

        AnalyticService.updateWordFreq(bubblesVm, tweetArr);
        AnalyticService.updateMentionFreq(bubblesVm, tweetArr);

    })

}

controllersModule.controller('BubbleCtrl', ['$http', '$stateParams', 'AnalyticService', 'socket', BubbleCtrl]);