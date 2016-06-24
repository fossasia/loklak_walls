'use strict';
/* global angular, alert, $ */
/* jshint unused:false */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
var moment = require('moment');
/**
 * @ngInject
 */
 function WallCtrl($scope, $rootScope, $timeout, AppsService, HelloService, SearchService, AuthService, $http, $interval, socket) {

    var vm = this;
    var term = '';
    // var $rootScope.modPostPromise; // For cancelling the $interval polling
    var searchParams;
    var latestCreatedAtDate = null;
    var maxStatusCount;

    $scope.isEditing = -1;
    $scope.wallsPresent = true;
    $scope.invalidFile = false;
    $scope.showNext = true;
    $scope.showStart = false;
    $scope.selectedTab = 0;
    $scope.isLoggedIn= $rootScope.root.isLoggedIn;
    $scope.currentUser=$rootScope.root.currentUser;
    $scope.statuses=[];
    
    // for thumbnail url
    $scope.current_id = function(){ return $rootScope.root.currentUser._id; }

    /*
     * Location UI component
     * If user input > 3 chars, suggest location
     * clicking on suggested location assign value to the according model
     */

     $scope.$watch('newWallOptions.chosenLocation', function() {
        if (document.activeElement.className.indexOf("wall-location-input") > -1) {
            if ($scope.newWallOptions.chosenLocation && $scope.newWallOptions.chosenLocation.length >= 3) {
                SearchService.getLocationSuggestions($scope.newWallOptions.chosenLocation).then(function(data) {
                    vm.hasSuggestions = true;
                    vm.locationSuggestions = data.queries;
                    angular.element($('.wall-location-list')).width(($('wall-location-input').width()));
                }, function(e) {
                    vm.hasSuggestions = false;
                    console.log(e);
                });
            } else {
                vm.hasSuggestions = false;
            }
        }
    });

     vm.setLocation = function(locationTerm) {
        $scope.newWallOptions.chosenLocation = locationTerm;
        vm.hasSuggestions = false;
    };

    var initWallOptions = function() {
        $scope.newWallOptions = {};
        $scope.newWallOptions.profanity = true;
        $scope.newWallOptions.images = true;
        $scope.newWallOptions.videos = false;
        $scope.newWallOptions.headerColour = '#3c8dbc';
        $scope.newWallOptions.headerForeColour = '#FFFFFF';
        $scope.newWallOptions.headerPosition = 'Top';
        $scope.newWallOptions.layoutStyle = 1;
        $scope.newWallOptions.moderation = false;
        $scope.newWallOptions.showLoading = false;
        $scope.newWallOptions.showStatistics = true;
        $scope.newWallOptions.showLoklakLogo = true;
        $scope.newWallOptions.showEventName = true;
    };

    $scope.tabSelected = function(index) {
        if(index === -1){
            $scope.selectedTab = 0;
        } else {
            $scope.selectedTab = index;
            if (index === 2) {
                $scope.showNext = false;
                $scope.showStart = true;
            } else if (index === 3){
                $scope.showNext = false;
                $scope.showStart = false;
            } else {
                $scope.showNext = true;
                $scope.showStart = false;
            }
        }

    };

    initWallOptions();

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    //Selects foreground colour as black or white based on background
    function colourCalculator(rgb) {
        var o = Math.round(((parseInt(rgb.r) * 299) + (parseInt(rgb.g) * 587) + (parseInt(rgb.b) * 114)) / 1000);
        if (o > 125) {
            return '#000000';
        } else {
            return '#FFFFFF';
        }
    }

    $scope.$watch('newWallOptions.headerColour', function() {
        if ($scope.newWallOptions.headerColour) {
            $scope.newWallOptions.headerForeColour = colourCalculator(hexToRgb($scope.newWallOptions.headerColour));
        }
    });

    $scope.$watch('newWallOptions.logo', function() {
        if ($scope.newWallOptions.logo) {
            if ($scope.newWallOptions.logo.filesize > 500000) {
                $scope.invalidFile = true;
                delete $scope.newWallOptions.logo;
            } else {
                $scope.invalidFile = false;
            }
        }
    });

    $scope.$watch('newWallOptions.mainHashtagText', function() {
        if ($scope.newWallOptions.mainHashtagText) {
            if ($scope.newWallOptions.mainHashtagText.length !== 0) {
                if ($scope.newWallOptions.mainHashtagText[0] !== '#') {
                    $scope.newWallOptions.mainHashtag = '#' + $scope.newWallOptions.mainHashtagText;
                } else {
                    $scope.newWallOptions.mainHashtag = $scope.newWallOptions.mainHashtagText;
                }
            }
        }
    });

    $scope.$watch('newWallOptions.images', function() {
        if ($scope.newWallOptions.images) {
            if ($scope.newWallOptions.images === 'only') {
                $scope.newWallOptions.videos = ['none'];
            }
        }
    });

    $scope.$watch('newWallOptions.videos', function() {
        if ($scope.newWallOptions.videos) {
            if ($scope.newWallOptions.videos === 'only') {
                $scope.newWallOptions.images = ['none'];
            }
        }
    });

    // sets searchParams from newWallOptions
    function calculateTerm() {
        var term = "",
        i;
        console.log('new wall options', $scope.newWallOptions)
        if ($scope.newWallOptions.id) {
            if ($scope.newWallOptions.layoutStyle === 1) {
                maxStatusCount = 10; //linear
            } else if ($scope.newWallOptions.layoutStyle === 2) {
                maxStatusCount = 20; //masonry
            } else if ($scope.newWallOptions.layoutStyle === 3) {
                maxStatusCount = 1; //single
            } else if ($scope.newWallOptions.layoutStyle === 4) {
                maxStatusCount = 10; //map
            }
        }
        for (i = 0; i < $scope.newWallOptions.all.length; i++) {
            term = term + ' ' + $scope.newWallOptions.all[i].text;
        }

        for (i = 0; i < $scope.newWallOptions.none.length; i++) {
            term = term + ' -' + $scope.newWallOptions.none[i].text;
        }

        if ($scope.newWallOptions.any.length > 0) {
            term = term + ' ' + $scope.newWallOptions.any[0].text;
            for (i = 1; i < $scope.newWallOptions.any.length; i++) {
                term = term + ' OR ' + $scope.newWallOptions.any[i].text;
            }
        }
        if ($scope.newWallOptions.mainHashtag) {
            if (term) {
                term = term + ' OR ' + $scope.newWallOptions.mainHashtag;
            } else {
                term = $scope.newWallOptions.mainHashtag;
            }
        }

        if ($scope.newWallOptions.layoutStyle === '4') {
            if (term === "") {
                term = "/location";
            } else {
                term = term + " /location";
            }
        }

        if ($scope.newWallOptions.images) {
            if ($scope.newWallOptions.images === "only") {
                term = term + ' /image';
            } else if ($scope.newWallOptions.images === "none") {
                term = term + ' -/image';
            }
        }

        if ($scope.newWallOptions.videos) {
            if ($scope.newWallOptions.videos === "only") {
                term = term + ' /video';
            } else if ($scope.newWallOptions.videos === "none") {
                term = term + ' -/video';
            }
        }

        if ($scope.newWallOptions.audio) {
            if ($scope.newWallOptions.audio === "only") {
                term = term + ' /audio';
            } else if ($scope.newWallOptions.audio === "none") {
                term = term + ' -/audio';
            }
        }

        if ($scope.newWallOptions.profanity) {
            if ($scope.newWallOptions.profanity === true) {
                term = term + ' -/profanity';
            }
        }

        if (!$scope.newWallOptions.blockRetweets) {
            term = term + ' include:retweets';
        }

        if ($scope.newWallOptions.chosenLocation) {
            term = term + ' near:' + $scope.newWallOptions.chosenLocation;
        }

        if ($scope.newWallOptions.sinceDate) {
            term = term + ' since:' + moment($scope.newWallOptions.sinceDate).format('YYYY-MM-DD_HH:mm');
        }

        if ($scope.newWallOptions.untilDate) {
            term = term + ' until:' + moment($scope.newWallOptions.untilDate).format('YYYY-MM-DD_HH:mm');
        }

        //clean up
        term = term.trim();
        if (term.substring(0, 2) === 'OR') {
            term = term.substring(2).trim();
        }

        console.log(term);
        searchParams.q = term;
        searchParams.count = maxStatusCount;
        if ($scope.newWallOptions.cycle) {
            if ($scope.newWallOptions.cyclePostLimit > searchParams.count) {
                searchParams.count = $scope.newWallOptions.cyclePostLimit;
            }
        }
        searchParams.fromWall = true;
    }
    $scope.proceed = function() {
        if ($scope.selectedTab === 1 && $scope.newWallOptions.cycle && !$scope.newWallOptions.cyclePostLimit || ($scope.newWallOptions.cyclePostLimit < 1) || ($scope.newWallOptions.cyclePostLimit > 100)) {
            alert("Invalid cycle post limit! Please enter a value between 1 and 100. We have set it to the recommended value.");
            $scope.newWallOptions.cyclePostLimit = 15;
        } else {
            if ($scope.selectedTab === 1 && $scope.newWallOptions.cycle && !$scope.newWallOptions.cycleDelayTime || ($scope.newWallOptions.cycleDelayTime < 1) || ($scope.newWallOptions.cycleDelayTime > 20)) {
                alert("Invalid cycle delay time! Please enter a value between 1 and 20. We have set it to the recommended value.");
                $scope.newWallOptions.cycleDelayTime = 5;
            } else {
                $scope.selectedTab++;
                $timeout(function() {
                    $('.nav-tabs > .active').next('li').find('a').trigger('click');
                });
                if ($scope.selectedTab === 2) {
                    $scope.showNext = false;
                    $scope.showStart = true;
                } else if ($scope.selectedTab === 3){
                    $scope.showNext = false;
                    $scope.showStart = false;
                }
            }
        }
    };


    $scope.lostCycleDelayFocus = function() {
        // if(!$scope.newWallOptions.cyclePostLimit || ($scope.newWallOptions.cyclePostLimit<1) || ($scope.newWallOptions.cyclePostLimit>20)){
        //     $scope.newWallOptions.cyclePostLimit = 15;
        // }
    };

    $scope.lostCyclePostsFocus = function() {
        // if(!$scope.newWallOptions.DelayTime || ($scope.DelayTime<1) || ($scope.newWallOptions.cycleDelayTime>100)){
        //     $scope.newWallOptions.cycleDelayTime = 5;
        // }
    };

    $scope.start = function() {
        //construct term

        delete $scope.newWallOptions.link;
        var dataParams = encodeURIComponent(angular.toJson($scope.newWallOptions));
        $('#wall-modal').modal('toggle');

        if ($rootScope.root.isLoggedIn) {
            $interval.cancel($rootScope.modPostPromise);

            // new wall options
            var saveData = new AppsService({
                user: $scope.currentUser._id,
                app: 'wall'
            });

            for (var k in $scope.newWallOptions) {
                saveData[k] = $scope.newWallOptions[k];
            }

            // Update wall options
            if ($scope.isEditing !== -1) { 
                $scope.userWalls[$scope.isEditing].$update({
                    user: $rootScope.root.currentUser._id,
                    app: 'wall',
                    id: $scope.userWalls[$scope.isEditing].id
                }, function(result) {
                    // calculateTerm(); // sets searchParams for searchLoklakServer 
                    // initWallOptions();

                    AppsService.query({
                        user: $scope.currentUser._id,
                        app: 'wall'
                    }, function(result) {
                        console.log("result", result);
                        $scope.userWalls = result;
                        if ($scope.userWalls.length === 0) {
                            $scope.wallsPresent = false;
                            console.log("No walls");
                        }
                        $scope.isEditing = -1;

                    });
                    // $scope.userWalls[$scope.isEditing].showLoading = false;
                    // $window.open('/' + $scope.currentUser._id + '/wall/' + $scope.userWalls[$scope.isEditing].id, '_blank');
                    // $scope.userWalls[$scope.isEditing].internal = {};
                    // $scope.userWalls[$scope.isEditing].internal.showLoading = false;
                });

            // Add new wall options
            } else { 
                $scope.userWalls.push(saveData);
                var latestWallIdx = $scope.userWalls.length - 1;

                $scope.userWalls[latestWallIdx].showLoading = true;

                var result = saveData.$save(function(result) {
                    console.log('latestWallIdx' , latestWallIdx)

                    // Update the wall dashboard thumbnail
                    $scope.newWallOptions.id = result.id;
                    console.log("save result", result);
                    for (var k in $scope.newWallOptions) {
                        if ($scope.newWallOptions.hasOwnProperty(k)) {
                            $scope.userWalls[latestWallIdx][k] = $scope.newWallOptions[k];
                        }
                    }
                    $scope.wallsPresent = true;

                    calculateTerm(); // sets searchParams for searchLoklakServer 
                    // Start the interval POST call

                    var posturl = '/api/tweets/'+ $rootScope.root.currentUser._id + '/' + $scope.userWalls[latestWallIdx].id;
                    var userWallId = $rootScope.root.currentUser._id + $scope.userWalls[latestWallIdx].id
        
                    var searchLoklakServer = function(){
                        console.log('searchParams', searchParams)

                        SearchService.initData(searchParams).then(function(data) {
                            // console.log('after search', data)
                            console.log('options', $scope.newWallOptions);
                            // If manual moderation, query loklak server, 
                            // set all approval to false, then add to store.
                            if(!$scope.newWallOptions.moderation){
                                data.statuses.map(function(tweet){
                                    tweet.userWallId = userWallId;
                                    tweet.approval = true;                                    
                                })
                            } else {
                                console.log("Manual moderation")
                                data.statuses.map(function(tweet){
                                    tweet.userWallId = userWallId;
                                    tweet.approval = false;
                                })
                            }
                                
                            console.log('statuses received from search', data.statuses)
                            // MANUAL MOD - add all to mongo if first poll, else filter then add and update most recent date
                            if(latestCreatedAtDate===null){
                                var toPost = {};
                                toPost.tweetArr = data.statuses;
                                toPost.userWallId = userWallId;

                                $http.post(posturl, toPost).then(function(result){
                                    console.log(result.data.message);
                                    if(data.statuses.length > 0 ) latestCreatedAtDate = (data.statuses[0].created_at);
                                    console.log("latest", latestCreatedAtDate)

                                    $scope.pollWallTweets();

                                }, function(err){ 
                                    console.log(err); 
                                })

                            } else {
                                data.statuses = data.statuses.filter(function(status){
                                    return status.created_at > latestCreatedAtDate;
                                }) 
                                var toPost = {};
                                toPost.tweetArr = data.statuses;
                                toPost.userWallId = userWallId;

                                $http.post(posturl, toPost).then(function(result){
                                    console.log(result.data.message);
                                    if(data.statuses.length > 0 ) latestCreatedAtDate = (data.statuses[0].created_at);
                                    console.log("latest", latestCreatedAtDate)

                                }, function(err){ 
                                    console.log(err); 
                                })
                            }

                        })
                    }

                    searchLoklakServer();
                    $rootScope.modPostPromise = $interval(function(){
                        searchLoklakServer();
                    }, 30000);

                    // Reset wall options
                    initWallOptions();
                    window.open('/' + $scope.currentUser._id + '/wall/' + result.id);
                    $scope.userWalls[latestWallIdx].showLoading = false;
                    

                });
            }

        } else {
            alert("Please sign in first");
        }
    };


    $scope.resetDate = function() {
        $scope.newWallOptions.sinceDate = null;
        $scope.newWallOptions.untilDate = null;
    };

    $scope.resetLogo = function() {
        $scope.newWallOptions.logo = null;
        //$scope.$apply();
    };

    // TODO: remove tweets with same userWallId
    $scope.deleteWall = function(index) {
        $interval.cancel($rootScope.modPostPromise);
        $http.delete('/api/tweets/'+$scope.currentUser._id+$scope.userWalls[index].id, index)
        // .then(function(data){console.log(data)});

        //console.log(index);
        $scope.userWalls[index].showLoading = true;
        $scope.userWalls[index].$delete({
            user: $scope.currentUser._id,
            app: 'wall',
            id: $scope.userWalls[index].id
        }, function(data) {
            $scope.userWalls[index].showLoading = false;
            $scope.userWalls.splice(index, 1);
            if ($scope.userWalls.length === 0) {
                $scope.wallsPresent = false;
            }
            //$scope.userWalls[index].showLoading = false;
        });
        $scope.isEditing = -1;
    };

    $scope.editWall = function(index) {
        console.log("Editing wall #", index);

        $scope.statuses = [];   
        $scope.newWallOptions = $scope.userWalls[index];
        $scope.isEditing = index;
        $('#wall-modal').modal('toggle');
                
        // Stop previous poll and Start poll for current wall to $scope.statuses, for 30s
        // $interval.cancel(modGetPromise);
        $scope.pollWallTweets();

        // Stop previous interval POST
        $interval.cancel($rootScope.modPostPromise);
        calculateTerm(); // sets searchParams for searchLoklakServer

        // Start selected wall's interval POST
        var posturl = '/api/tweets/'+ $rootScope.root.currentUser._id + '/' + $scope.userWalls[index].id;
        var userWallId = $rootScope.root.currentUser._id + $scope.userWalls[index].id
        
        var searchLoklakServer = function(){
            console.log('searchParams', searchParams)

            SearchService.initData(searchParams).then(function(data) {
                // console.log('after search', data)
                console.log('options', $scope.newWallOptions);
                // If manual moderation, query loklak server, 
                // set all approval to false, then add to store.
                if(!$scope.newWallOptions.moderation){
                    data.statuses.map(function(tweet){
                        tweet.userWallId = userWallId;
                        tweet.approval = true;                                    
                    })
                } else {
                    console.log("Manual moderation")
                    data.statuses.map(function(tweet){
                        tweet.userWallId = userWallId;
                        tweet.approval = false;
                    })
                }

                console.log('statuses received from search', data.statuses)
                // MANUAL MOD - add all to mongo if first poll, else filter then add and update most recent date
                if(latestCreatedAtDate===null){
                    var toPost = {};
                    toPost.tweetArr = data.statuses;
                    toPost.userWallId = userWallId;

                    $http.post(posturl, toPost).then(function(result){
                        console.log(result.data.message);
                        if(data.statuses.length > 0 ) latestCreatedAtDate = (data.statuses[0].created_at);
                        console.log("latest", latestCreatedAtDate)

                        $scope.pollWallTweets();

                    }, function(err){ 
                        console.log(err); 
                    })

                } else {
                    data.statuses = data.statuses.filter(function(status){
                        return status.created_at > latestCreatedAtDate;
                    }) 
                    var toPost = {};
                    toPost.tweetArr = data.statuses;
                    toPost.userWallId = userWallId;

                    $http.post(posturl, toPost).then(function(result){
                        console.log(result.data.message);
                        if(data.statuses.length > 0 ) latestCreatedAtDate = (data.statuses[0].created_at);
                        console.log("latest", latestCreatedAtDate)

                    }, function(err){ 
                        console.log(err); 
                    })
                }

            })
        }
        searchLoklakServer();
        $rootScope.modPostPromise = $interval(function(){
            searchLoklakServer();
        }, 30000);

    };

    $scope.pollWallTweets = function(){

            console.log($scope.userWalls)

        var userWallTweetsUrl="";
        if($scope.isEditing !== -1){
            userWallTweetsUrl = '/api/tweets/'+ $rootScope.root.currentUser._id + $scope.userWalls[$scope.isEditing].id;
        }else{
            userWallTweetsUrl = '/api/tweets/'+ $rootScope.root.currentUser._id +$scope.userWalls[$scope.userWalls.length-1].id;
        }

        function getAllTweets(){
            $http.get(userWallTweetsUrl).then(function(result){
                // addNewTweets(result.data.tweetArr);
                $scope.statuses = result.data.statuses;
                latestCreatedAtDate = $scope.statuses.length>0 ? $scope.statuses[0].created_at : null;
            })
        }

        function addNewTweets(newStatuses){
            // if current moderation empty or, all new data statuses are newer prepend whole array to tweet store array
            if($scope.statuses.length===0 ){
                $scope.statuses = newStatuses;
            } else {
                var idx =0;
                var dataMostRecent = newStatuses.length > 0 ? newStatuses[idx].created_at : null;
                var storeMostRecent = $scope.statuses[0].created_at;
                // else prepend only new tweets to localStorage tweets array in desc order
                while(dataMostRecent !== null && dataMostRecent > storeMostRecent && idx < newStatuses.length){
                    $scope.statuses.splice(idx, 0, newStatuses[idx]);
                    dataMostRecent = newStatuses[++idx].created_at;
                }
            }
        }

        getAllTweets();
        // modGetPromise = $interval(getAllTweets, 30000);
    }

    $scope.openModal = function() {
        initWallOptions();
        $('#wall-modal').modal('toggle');
        $scope.selectedTab = 0;
    };

    var init = function() {
        searchParams = {};
        if ($scope.isLoggedIn) {
            $scope.userWalls = AppsService.query({
                user: $scope.currentUser._id,
                app: 'wall'
            }, function(result) {
                if ($scope.userWalls.length === 0) {
                    $scope.wallsPresent = false;
                    console.log("No walls");
                }
            });
        }
    };

    init();

    socket.on('addNewTweetsArr', function(tweetArr){
        tweetArr.forEach(function(el,idx){
            if(el.userWallId === $scope.currentUser._id + $scope.userWalls[$scope.isEditing].id)
                $scope.statuses.splice(idx,0,el);
        })
    })

    $scope.$on('$destroy', function() {
        if ($rootScope.modPostPromise) {
            $interval.cancel($rootScope.modPostPromise);
        }
        socket.removeAllListeners();

    });

    angular.element(document).bind("keydown", function(event) {
        if (event.keyCode === 27) {
            $scope.$apply(function() {
                $scope.tweetModalShow = false;   
                $scope.isEditing = -1;
                $scope.selectedTab=0;
            });
        }
    });

}

controllersModule.controller('WallCtrl', ['$scope', '$rootScope', '$timeout', 'AppsService', 'HelloService', 'SearchService', 'AuthService', '$http', '$interval', 'socket', WallCtrl]);
