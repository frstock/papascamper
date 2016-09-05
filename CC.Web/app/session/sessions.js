(function () {
    'use strict';

    var controllerId = 'sessions';

    angular
        .module('app')
        .controller(controllerId, sessions);

    sessions.$inject = ['$routeParams','common', 'config', 'datacontext'];

    function sessions($routeParams, common, config, datacontext) {
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;

        var applyFilter = function () { };

        vm.title = 'Sessions';
        vm.refresh = refresh;
        vm.sessions = [];
        vm.filteredSessions = [];
        vm.sessionsFilter = sessionsFilter;
        vm.sessionsSearch = $routeParams.search || '';
        vm.search = search;

        activate();

        function activate() {
            var promises = [getSessions()];
            common.activateController(promises, controllerId)
                .then(function () {
                    // createSearchThrottle uses values by convention, via its parameters:
                    //  * vm.sessionSearch is where the user enters the search
                    //  * vm.session is the original unfiltered array
                    //  * vm.filteredSession is the filtered array
                    //  * vm.sessionsFilter is the filtering function

                    applyFilter = common.createSearchThrottle(vm, 'sessions');
                    if (vm.sessionsSearch) { applyFilter(true); }

                    log('Activated Sessions View');
                });
        }

        function getSessions(forceRefresh) {
            return datacontext
                .getSessionPartials(forceRefresh)
                .then(function (data) {
                    return vm.sessions = vm.filteredSessions = data;
                });
        }

        function refresh() {
            getSessions(true)
        }

        function search($event) {
            if ($event.keyCode === keyCodes.escape) {
                vm.sessionsSearch = '';
            }

            applyFilter();
        }

        function sessionsFilter(session) {
            var textContains = common.textContains;
            var searchText = vm.sessionsSearch;
            var isMatch = searchText ?
                textContains(session.title, searchText)
                    || textContains(session.tagFormatted, searchText)
                    || textContains(session.room.name, searchText)
                    || textContains(session.track.name, searchText)
                    || textContains(session.speaker.fullName, searchText)
                : true;

            return isMatch;
        }
    }
})();
