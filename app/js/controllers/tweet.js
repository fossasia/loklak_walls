'use strict';

var controllersModule = require('./_index');
var hello=require('../components/hello.all');


controllersModule.controller('HomeCtrl', ['$rootScope', function($rootScope) {

    $rootScope.root.tweet="";
    $rootScope.root.location={};
    var locationURL;
    $rootScope.root.postTweet = function() 
    { 
    $('#myModal').modal('hide');     
    var message = $rootScope.root.tweet;
    var tweet = encodeURIComponent(message);
    
    console.log(message);
    hello('twitter').api('me/share', 'POST', {
        message : tweet
    });
    
    };
    $rootScope.root.getLocation = function(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setPosition);
    } else { 
        alert("Geolocation is not supported by this browser.");
    }
}

function setPosition(position) {
    $rootScope.root.location.latitude=position.coords.latitude; 
    $rootScope.root.location.longitude=position.coords.longitude;
    $rootScope.root.location.tile="http://loklak.org/vis/map.png?text=Test&mlat="+position.coords.latitude+"&mlon="+position.coords.longitude+"&zoom=13&width=512&height=256";
    $("#locationtile").attr("src", $rootScope.root.location.tile);
    $("#locationtile").removeClass('hidden');
    console.log( $rootScope.root.location.tile);
}

}]);
