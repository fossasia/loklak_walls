'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function linearLayoutDirective() {

  return {
    scope: {
    	data: '=',
    	cardbgcolor:'=',
    	cardtxtcolor:'=',
    },
    templateUrl: 'wall/templates/linear.html',
  };

}

directivesModule.directive('linear', linearLayoutDirective);