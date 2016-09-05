(function () {
    'use strict';
    var controllerId = 'dashboard';
    angular.module('app').controller(controllerId, ['common', 'datacontext', dashboard]);

    function dashboard(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;

        vm.content = {
            predicate: '',
            reverse: false,
            setSort: setContentSort,
            title: 'Content',
            tracks: []
        };
        vm.map = {
            title: 'Location'
        };
        vm.news = {
            title: 'Code Camp',
            description: 'Vestibulum imperdiet, lectus vitae semper sodales, eros leo aliquet felis, ac molestie tellus diam ' +
                'id nibh. Vivamus neque sem, interdum quis suscipit vel, luctus at ante. Maecenas ac tellus nibh. Aenean mollis et' +
                ' odio eu sodales. Aenean finibus suscipit pharetra. Fusce rutrum dictum maximus. Duis felis lectus, malesuada' +
                ' ac nisl in, scelerisque vestibulum velit. Ut nec turpis at urna accumsan vehicula. Curabitur vel dui tincidunt, ' +
                'dignissim metus sit amet, lobortis tortor. Praesent pharetra enim a vulputate condimentum. Donec nunc lorem, ' +
                'suscipit sit amet ex nec, maximus rhoncus leo. Nunc venenatis elit quam.'
        };
        vm.attendeeCount = 0;
        vm.sessionCount = 0;
        vm.speakerCount = 0;
        vm.people = [];
        vm.speakers = {
            interval: 5000,
            list: [],
            title: 'Top Speakers'
        };
        vm.title = 'Dashboard';
        vm.trackCount = 0;

        activate();

        function activate() {
            var promises = [getAttendeeCount(), getSessionCount(), getSpeakerCount(), getTopSpeakers(), getTrackCount()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Dashboard View'); });
        }

        function getAttendeeCount() {
            return datacontext.getAttendeeCount().then(function (data) {
                return vm.attendeeCount = data;
            });
        }

        function getSessionCount() {
            return datacontext.getSessionCount().then(function (data) {
                return vm.sessionCount = data;
            });
        }

        function getTrackCount() {
            return datacontext.getTrackCount().then(function (data) {
                return vm.content.tracks = data;
            });
        }

        function getTopSpeakers() {
            vm.speakers.list = datacontext.getSpeakersTopLocal();
        }

        function getSpeakerCount() {
            var speakers = datacontext.getSpeakerCount();
            vm.speakerCount = speakers.length;
        }

        function setContentSort(prop) {
            vm.content.predicate = prop;
            vm.content.reverse = !vm.content.reverse;
        }
    }
})();