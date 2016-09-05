(function () {
    'use strict';

    var controllerId = 'attendees';
    angular
        .module('app')
        .controller(controllerId, attendees);

    attendees.$inject = ['common', 'config', 'datacontext'];

    function attendees(common, config, datacontext) {
        /* jshint validthis:true */
        var vm = this;

        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;

        vm.attendees = [];
        vm.attendeeCount = 0;
        vm.attendeeFilteredCount = 0;
        vm.attendeesSearch = '';
        vm.fiteredAttendees = [];
        vm.pageChanged = pageChanged;
        vm.paging = {
            currentPage: 1,
            maxPagesToShow: 5,
            pageSize: 15
        }
        vm.refresh = refresh;
        vm.search = search;
        vm.title = 'Attendees';

        Object.defineProperty(vm.paging, 'pageCount', {
            get: function () {
                return Math.floor(vm.attendeeFilteredCount / vm.paging.pageSize) + 1;
            }
        })

        activate();

        function activate() {
            var promises = [getAttendees()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Attendees View'); });
        }

        function getAttendeeCount() {
            return datacontext.getAttendeeCount().then(function (data) {
                return vm.attendeeCount = data;
            });
        }

        function getAttendeeFilteredCount() {
            vm.attendeeFilteredCount = datacontext.getAttendeeFilteredCount(vm.attendeesSearch);
        }
        function getAttendees(forceRefresh) {
            return datacontext.getAttendees(forceRefresh, vm.paging.currentPage,
                vm.paging.pageSize, vm.attendeesSearch)
                .then(function (data) {
                    vm.attendees = data

                    getAttendeeFilteredCount();

                    if (!vm.attendeeCount || forceRefresh) {
                        getAttendeeCount();
                    }

                    return data;
                });
        }

        function refresh() {
            return getAttendees(true);
        }

        function search($event) {
            if ($event.keyCode === keyCodes.escape) {
                vm.attendeesSearch = '';
            }

            getAttendees();
        }

        function pageChanged(page) {
            if (!page) { return; }

            vm.paging.currentPage = page;
            getAttendees();
        }
    }
})();
