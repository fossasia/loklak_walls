'use strict';

var controllersModule = require('./_index');

function ProfileCtrl($http, AppSettings, SearchService) { // jshint ignore:line
	var vm = this;
	vm.linkTwitter = function(){
		$http.get("/api/login/twitter")
	}
	vm.unlinkTwitter = function(){
		$http.get("/api/unlink/twitter")
	}
  
}

controllersModule.controller('ProfileCtrl', ['$http', 'AppSettings', 'SearchService', ProfileCtrl]);