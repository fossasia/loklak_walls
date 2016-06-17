'use strict';

var directivesModule = require('./_index.js');

/**
 * @ngInject
 */
function linearLayoutDirective() {

  return {
    scope: {
    	data: '=',
    },
    templateUrl: 'wall/templates/linear-approve.html',
  };

}

directivesModule.directive('linear-approve', linearLayoutDirective);