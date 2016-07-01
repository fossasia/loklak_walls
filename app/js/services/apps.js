'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function AppsService($q, $http, $resource) {

    // var url = AppSettings.oauthProxyUrl.split('/')[0] + '/' + AppSettings.oauthProxyUrl.split('/')[1] + '/' + AppSettings.oauthProxyUrl.split('/')[2];

    // return $resource(url + '/:user/:app/:id', {
    return $resource('/api/:user/:app/:id', {
        user: '@user',
        app: '@app',
        id: '@id'
    }, {
        query: {
            method: 'GET',
            isArray: true,
            params: {
                user: '@user',
                app: '@app',
            }
        },

        save: {
            method: 'POST',
            params: {
                user: '@user',
                app: '@app',
                id: '@id'
            }
        },
        update: {
            method: 'PUT',
            params: {
                user: '@user',
                app: '@app',
                id: '@id'
            }
        }
    });

}

servicesModule.service('AppsService', ['$q', '$http', '$resource', AppsService]);
