(function () {
    'use strict';

    var controllerId = 'speakers';
    angular
        .module('app')
        .controller(controllerId, speakers);

    speakers.$inject = ['common', 'config', 'datacontext'];

    function speakers(common, config, datacontext) {
        /* jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;

        vm.filteredSpeakers = [];
        vm.title = 'Speakers';
        vm.refresh = refresh;
        vm.speakers = [];
        vm.speakerSearch = '';
        vm.search = search;

        activate();

        function activate() {
            var promises = [getSpeakers()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Speakers View'); });
        }

        function getSpeakers(forceRefresh) {
            return datacontext.getSpeakerPartials(forceRefresh).then(function (data) {
                vm.speakers = data;
                applyFilter();

                return vm.speakers;
            });
        }

        function refresh() {
            return getSpeakers(true);
        }

        function search($event) {
            if ($event.keyCode === keyCodes.escape) {
                vm.speakerSearch = '';
                applyFilter(true);
            } else {
                applyFilter();
            }
        }

        function applyFilter() {
            vm.filteredSpeakers = vm.speakers.filter(speakerFilter);
        }

        function speakerFilter(speaker) {
            var isMatch = vm.speakerSearch ? common.textContains(speaker.fullName, vm.speakerSearch) : true;
            return isMatch;
        }
    }
})();
