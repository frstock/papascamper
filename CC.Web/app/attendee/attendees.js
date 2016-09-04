(function () {
    'use strict';

    var controllerId = 'attendees';
    angular
        .module('app')
        .controller(controllerId, attendees);

    attendees.$inject = ['common', 'datacontext'];

    function attendees(common, datacontext) {
        /* jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        vm.title = 'Attendees';
        vm.refresh = refresh;
        vm.attendees = [];

        activate();

        function activate() {
            var promises = [getAttendees()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Attendees View'); });
        }

        function getAttendees(forceRefresh) {
            return datacontext.getAttendees(forceRefresh).then(function (data) {
                return vm.attendees = data;
            });
        }

        function refresh() {
            return getAttendees(true);
        }
    }
})();
