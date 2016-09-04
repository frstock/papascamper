(function () {
    'use strict';

    var controllerId = 'speakers';
    angular
        .module('app')
        .controller(controllerId, speakers);

    speakers.$inject = ['common', 'datacontext'];

    function speakers(common, datacontext) {
        /* jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        vm.title = 'Speakers';
        vm.refresh = refresh;
        vm.speakers = [];

        activate();

        function activate() {
            var promises = [getSpeakers()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Speakers View'); });
        }

        function getSpeakers(forceRefresh) {
            return datacontext.getSpeakerPartials(forceRefresh).then(function (data) {
                return vm.speakers = data;
            });
        }

        function refresh() {
            return getSpeakers(true);
        };
    }
})();
