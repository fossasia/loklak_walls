'use strict';

var servicesModule = require('./_index.js');

/**
 * @ngInject
 */
function TweetsService($q, $http, $resource, AppSettings, AuthService) {

    // var url = AppSettings.oauthProxyUrl.split('/')[0] + '/' + AppSettings.oauthProxyUrl.split('/')[1] + '/' + AppSettings.oauthProxyUrl.split('/')[2];

    // return $resource(url + '/:user/:app/:id', {
    return $resource('/api/tweets/:userId/:wallId/:tweetId', {
        userId: '@userId',
        wallId: '@wallId',
        tweetId: '@tweetId'
    }, {
        query: {
            method: 'GET',
            isArray: true,
            params: {
                userId: '@userId',
                wallId: '@wallId',
            }
        },

        save: {
            method: 'POST',
            params: {
                userId: '@userId',
                wallId: '@wallId',
            }
        },
        update: {
            method: 'PUT',
            params: {
                userId: '@userId',
                wallId: '@wallId',
                tweetId: '@tweetId'
            }
        }
    });

}

servicesModule.service('TweetsService', ['$q', '$http', '$resource', 'AppSettings', 'AuthService', TweetsService]);

