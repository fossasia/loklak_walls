'use strict';

var filtersModule = require('./_index.js');

/**
 * @ngInject
 */
 function hexToRgb(hex) {
 	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
 	return result ? {
 		r: parseInt(result[1], 16),
 		g: parseInt(result[2], 16),
 		b: parseInt(result[3], 16)
 	} : null;
 }

 function colourCalculator(rgb) {
 	var o = Math.round(((parseInt(rgb.r) * 299) + (parseInt(rgb.g) * 587) + (parseInt(rgb.b) * 114)) / 1000);
 	if (o > 125) {
 		return 'linkDark';
 	} else {
 		return 'linkLight';
 	}
 }

 filtersModule.filter('linkColorToClass', function () {
 	return function(input) {
		return colourCalculator(hexToRgb(input));
 	};
 });