(function () {
    'use strict';

    var controllerId = 'sessions';

    angular
        .module('app')
        .controller(controllerId, sessions);

    sessions.$inject = ['common', 'datacontext'];

    function sessions(common, datacontext) {
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        vm.title = 'Sessions';
        vm.refresh = refresh;
        vm.sessions = [];

        activate();

        function activate() {
            var promises = [getSessions()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Sessions View'); });
        }

        function getSessions(forceRefresh) {
            return datacontext
                .getSessionPartials(forceRefresh)
                .then(function (data) {
                    return vm.sessions = data;
                });
        }

        function refresh() {
            getSessions(true)
        }
    }
})();
