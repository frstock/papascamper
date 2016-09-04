(function () {
    'use strict';

    var serviceId = 'datacontext';

    angular
        .module('app')
        .factory(serviceId, datacontext);

    datacontext.$inject = ['config', 'common', 'entityManagerFactory', 'model'];

    function datacontext(config, common, entityManagerFactory, model) {
        var EntityQuery = breeze.EntityQuery;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
        var logError = getLogFn(serviceId, 'error');
        //var logSuccess = getLogFn(serviceId, 'success');

        var entityNames = model.entityNames;
        var storeMeta = {
            isLoaded: {
                sessions: false,
                attendees: false
            }
        };  

        var promise;
        var manager = entityManagerFactory.newManager();

        var $q = common.$q;

        var service = {
            getPeople: getPeople,
            getMessageCount: getMessageCount,
            getSessionPartials: getSessionPartials,
            getSpeakerPartials: getSpeakerPartials,
            getAttendees: getAttendees,
            getLookups: getLookups,
            prime: prime
        };

        return service;

        function getMessageCount() { return $q.when(72); }

        function getPeople() {
            var people = [
                { firstName: 'John', lastName: 'Papa', age: 25, location: 'Florida' },
                { firstName: 'Ward', lastName: 'Bell', age: 31, location: 'California' },
                { firstName: 'Colleen', lastName: 'Jones', age: 21, location: 'New York' },
                { firstName: 'Madelyn', lastName: 'Green', age: 18, location: 'North Dakota' },
                { firstName: 'Ella', lastName: 'Jobs', age: 18, location: 'South Dakota' },
                { firstName: 'Landon', lastName: 'Gates', age: 11, location: 'South Carolina' },
                { firstName: 'Haley', lastName: 'Guthrie', age: 35, location: 'Wyoming' }
            ];
            return $q.when(people);
        }

        function getSessionPartials(forceRefresh) {
            var orderBy = 'timeSlotId, level, speaker.firstName'
            var sessions = [];

            if (_areSessionsLoaded() && !forceRefresh) {
                sessions = _getAllLocal(entityNames.session, orderBy);
                return $q.when(sessions);
            }

            return EntityQuery.from('Sessions')
                .select('id, title, code, speakerId, trackId, timeSlotId, roomId, level, tags')
                .orderBy(orderBy)
                .toType(entityNames.session)
                .using(manager)
                .execute()
                .then(querySucceeded)
                .catch(_queryFailed);

            function querySucceeded(data) {
                sessions = data.results;
                _areSessionsLoaded(true);
                log('Retrieved [Session Partials] from remote data source', sessions.length, true);

                return sessions;
            }
        }

        function getSpeakerPartials(forceRefresh) {
            var orderBy = 'firstName, lastName';
            var predicate = breeze.Predicate.create('isSpeaker', '==', true);

            var speakers = [];
            
            if (!forceRefresh) {
                speakers = _getAllLocal(entityNames.speaker, orderBy, predicate);
                return $q.when(speakers);
            }

            return EntityQuery.from('Speakers')
                .select('id, firstName, lastName, imageSource')
                .orderBy(orderBy)
                .toType(entityNames.speaker)
                .using(manager)
                .execute()
                .then(querySucceeded)
                .catch(_queryFailed);

            function querySucceeded(data) {
                speakers = data.results;
                speakers.forEach(function (speaker) {
                    speaker.isSpeaker = true;
                });

                log('Retrieved [Speakers Partials] from remote data source', speakers.length, true);

                return speakers;
            }
        }

        function getAttendees(forceRefresh) {
            var orderBy = 'firstName, lastName';
            var attendees = [];

            if (_areAttendeesLoaded() && !forceRefresh) {
                attendees = _getAllLocal(entityNames.attendee, orderBy);
                return $q.when(attendees);
            }

            return EntityQuery.from('Persons')
                .select('id, firstName, lastName, imageSource')
                .orderBy(orderBy)
                .toType(entityNames.attendee)
                .using(manager)
                .execute()
                .then(querySucceeded)
                .catch(_queryFailed);

            function querySucceeded(data) {
                attendees = data.results;
                _areAttendeesLoaded(true);
                log('Retrieved [Attendees Partials] from remote data source', attendees.length, true);

                return attendees;
            }
        }

        function prime() {
            if (!promise) {
                promise = $q.all([getLookups(), getSpeakerPartials(true)])
                    .then(extendMetadata)
                    .then(success);
            }

            return promise;

            function success() {
                setLookups();
                log('Primed the data.');
            }

            function extendMetadata() {
                var metadataStore = manager.metadataStore;
                var types = metadataStore.getEntityTypes();

                types.forEach(function (type) {
                    if (type instanceof breeze.EntityType) {
                        set(type.shortName, type);
                    }
                });

                var personEntityName = entityNames.person;
                ['Speakers', 'Speaker', 'Attendees', 'Attendee'].forEach(function (resourceName) {
                    set(resourceName, personEntityName);
                });

                function set(resourceName, entityName) {
                    metadataStore.setEntityTypeForResourceName(resourceName, entityName);
                }
            }
        }

        function setLookups() {
            service.lookupCachedData = {
                rooms: _getAllLocal(entityNames.room, 'name'),
                tracks: _getAllLocal(entityNames.track, 'name'),
                timeSlots: _getAllLocal(entityNames.timeSlot, 'start')
            };
        }

        function _getAllLocal(resource, ordering, predicate) {
            return EntityQuery.from(resource)
                .orderBy(ordering)
                .where(predicate)
                .using(manager)
                .executeLocally();
        }

        function getLookups() {
            return EntityQuery
                .from('Lookups')
                .using(manager)
                .execute()
                .then(querySucceeded)
                .catch(_queryFailed);

            function querySucceeded(data) {
                log('Retrieved [Lookups]', data, true);
                return true;
            }
        }

        function _queryFailed(error) {
            var message = config.appErrorPrefix + 'Error retrieving data.' + error.message;
            logError(message);
        }

        function _areSessionsLoaded(value) {
            return _areItemsLoaded('sessions', value);
        }

        function _areAttendeesLoaded(value) {
            return _areItemsLoaded('attendees', value);
        }

        function _areItemsLoaded(key, value) {
            if (value === undefined) {
                return storeMeta.isLoaded[key];
            }

            return storeMeta.isLoaded[key] = true;
        }
    }
})();