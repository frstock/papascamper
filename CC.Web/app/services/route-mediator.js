(function () {
    'use strict';

    var serviceId = 'routeMediator';
    angular
        .module('app')
        .factory('routeMediator', routeMediator);

    routeMediator.$inject = ['$location', '$rootScope', 'config', 'logger'];

    function routeMediator($location, $rootScope, config, logger) {
        var isErrorHandled = false;

        var service = {
            setupRoutingHandlers: setupRoutingHandlers
        };

        return service;

        function setupRoutingHandlers() {
            handleRoutingErrors();
            updateDocTitle();
        }

        function handleRoutingErrors() {
            $rootScope.$on('$routeChangeError',
                function (event, current, previous, rejection) {
                    if (isErrorHandled === true) { return; }

                    isErrorHandled = true;

                    var message = 'Error routing: ' + (current && current.name) + '. ' + (rejection.message || '');
                    logger.logWarning(message, current, serviceId, true);
                    $location.path('/');
                });
        }

        function updateDocTitle() {
            $rootScope.$on('$routeChangeSuccess',
                function (event, current) {
                    isErrorHandled = false;

                    var title = config.docTitle + ' ' + (current.title || '');
                    $rootScope.title = title;
                });
        }
    }
})();