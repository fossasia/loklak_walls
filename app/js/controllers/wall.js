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
 function WallCtrl($scope, $rootScope, $timeout, AppsService, HelloService, SearchService, AuthService, $http, $interval, socket, SweetAlert) {

    var vm = this;
    var term = '';
    var searchParams;
    var latestCreatedAtDate = null;
    var maxStatusCount;

    $scope.isEditing = -1;
    $scope.lastEdited = -1;
    $scope.wallsPresent = true;
    $scope.invalidFile = false;
    $scope.showNext = true;
    $scope.showStart = false;
    $scope.selectedTab = 0;
    $scope.isLoggedIn= $rootScope.root.isLoggedIn;
    $scope.currentUser= $rootScope.root.currentUser;
    $scope.statuses= [];
    $scope.newAnnounce= {
        duration: 15,
    };
    $scope.announces=[];

    
    // for thumbnail url
    $scope.current_id = function(){ return $rootScope.root.currentUser._id; }

    // for submitting annoucement
    $scope.addAnnounce = function(){
        var userWallId = $rootScope.root.currentUser._id + $scope.userWalls[$scope.isEditing].id;
        console.log(userWallId, $scope.newAnnounce)
        $http.post('/api/announces/' + userWallId, $scope.newAnnounce)
        .success(function(data) {
            console.log(data);
            // clear form
            $scope.newAnnounce = {
                duration: 15,
            };
        }).error(function() {
            SweetAlert.alert("Please try again", {title: "Error Adding Annoucement!"});
        });

    }

    $scope.editAnnounce = function(announce){
        $scope.newAnnounce = announce;
        $scope.newAnnounce.startDateTime = new Date(announce.startDateTime);
    }

    $scope.deleteAnnounce = function(announce){
        var userWallId = $rootScope.root.currentUser._id + $scope.userWalls[$scope.isEditing].id;
        var idx = $scope.announces.map(function(ann){ return ann._id; }).indexOf(announce._id);
        if (idx > -1) {
            $scope.announces.splice(idx, 1);
            $http.delete('/api/announces/'+ userWallId + '/' + announce._id);
        }
    }
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
        $scope.newWallOptions.wallBgColour = '#ecf0f5';
        $scope.newWallOptions.cardBgColour = '#ffffff';
        $scope.newWallOptions.headerPosition = 'Top';
        $scope.newWallOptions.layoutStyle = 1;
        $scope.newWallOptions.moderation = false;
        $scope.newWallOptions.showLoading = false;
        $scope.newWallOptions.showStatistics = true;
        $scope.newWallOptions.showLoklakLogo = true;
        $scope.newWallOptions.showEventName = true;
    };

    $scope.tabSelected = function(index) {
        $scope.selectedTab = index;
        if (index === 2) {
            $scope.showNext = false;
            $scope.showStart = true;
        } else if (index >= 3){
            $scope.showNext = false;
            $scope.showStart = false;
        } else {
            $scope.showNext = true;
            $scope.showStart = false;
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

    $scope.$watch('newWallOptions.cardBgColour', function() {
        if ($scope.newWallOptions.cardBgColour) {
            $scope.newWallOptions.cardForeColour = colourCalculator(hexToRgb($scope.newWallOptions.cardBgColour));
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
                if($scope.selectedTab <= 1){
                    $scope.showNext = true;
                    $scope.showStart = false;
                } else if ($scope.selectedTab === 2) {
                    $scope.showNext = false;
                    $scope.showStart = true;
                } else if ($scope.selectedTab >= 3){
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

        // delete $scope.newWallOptions.link;
        // var dataParams = encodeURIComponent(angular.toJson($scope.newWallOptions));
        $('#wall-modal').modal('toggle');

        $scope.currentUser = $rootScope.root.currentUser;

        if($rootScope.root.isLoggedIn) {
            // $interval.cancel($rootScope.modPostPromise);

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
                    initWallOptions();

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
                    initWallOptions();

                    // Open new wall
                    window.open('/' + $scope.currentUser._id + '/wall/' + result.id);
                    $scope.userWalls[latestWallIdx].showLoading = false;

                });
        }
        // Reset isEditing to -1
        $scope.isEditing = -1;

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

$scope.resetLogoAnnounce = function() {
    $scope.newAnnounce.logo = null;
    //$scope.$apply();
};

    $scope.deleteWall = function(index) {
        $scope.currentUser=$rootScope.root.currentUser;
        // $interval.cancel($rootScope.modPostPromise);
        $http.delete('/api/tweets/'+$scope.currentUser._id+$scope.userWalls[index].id, index)
        // .then(function(data){console.log(data)});
        $http.delete('/api/announces/'+$scope.currentUser._id+$scope.userWalls[index].id)

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
        $scope.tabSelected(-1);
    };

    $scope.editWall = function(index) {
        console.log("Editing wall #", index);
        var currentUserId = $rootScope.root.currentUser._id;
        var wallId = $scope.userWalls[index].id

        $scope.statuses = [];   
        $scope.newWallOptions = $scope.userWalls[index];
        $scope.newWallOptions.sinceDate = new Date($scope.newWallOptions.sinceDate);
        $scope.newWallOptions.untilDate = new Date($scope.newWallOptions.untilDate);

        // Remove previous index's listener
        if($scope.lastEdited > -1){
            socket.removeListener('addNewTweets' + currentUserId + $scope.userWalls[$scope.lastEdited].id);
        }

        $scope.isEditing = index;
        $('#wall-modal').modal('toggle');


        // POLL MODERATION DATA FROM DB, THEN LISTEN FOR SOCKET.IO EVENTS
        var userWallId =  currentUserId + wallId;
        $http.get('/api/tweets/' + userWallId).then(function(res){
            $scope.statuses=res.data.statuses;
        });

        socket.on('addNewTweets' + userWallId, function(tweetArr){
            tweetArr.forEach(function(el,idx){
                $scope.statuses.splice(idx,0,el);
            })
        })

        $http.get('/api/announces/' + userWallId).then(function(res){
            $scope.announces=res.data.announces;
        });

        // Insert sorted by start date
        socket.on('addNewAnnounce' + currentUserId + wallId, function(announce){
            var idx = 0,
                len = $scope.announces.length,
                announceStart = new Date(announce.startDateTime);
            while(idx<len){
                var currentAnnounceStart = new Date($scope.announces[idx].startDateTime);
                if(announceStart <= currentAnnounceStart){
                    $scope.announces.splice(idx,0,announce);
                    return;
                }
                idx++;
            }
            if(len === 0){
                $scope.announces.splice(idx,0,announce);
            }

        })
};

$scope.pollWallTweets = function(){

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
        $('#selectTab a[href="#info"]').tab('show') // Select tab by name
        $scope.isEditing=-1;
    };

    var init = function() {
        searchParams = {};
        $http.get('/api/currentuser').success(function(data){
            $scope.userWalls = AppsService.query({
                user: data._id,
                app: 'wall'
            }, function(result) {
                if ($scope.userWalls.length === 0) {
                    $scope.wallsPresent = false;
                    console.log("No walls");
                }
            });
        })
    };

    init();

    $scope.$on('$destroy', function() {
        // if ($rootScope.modPostPromise) {
        //     $interval.cancel($rootScope.modPostPromise);
        // }
        socket.removeAllListeners();
    });

    angular.element(document).bind("keydown", function(event) {
        if (event.keyCode === 27) {
            $scope.$apply(function() {
                $scope.tweetModalShow = false;   
                $scope.isEditing = -1;
                $scope.selectedTab = 0;
            });
        }
    });

}

controllersModule.controller('WallCtrl', ['$scope', '$rootScope', '$timeout', 'AppsService', 'HelloService', 'SearchService', 'AuthService', '$http', '$interval', 'socket', 'SweetAlert', WallCtrl]);
