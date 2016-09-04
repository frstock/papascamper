(function () {
    'use strict';

    var serviceId = 'model';
    angular
        .module('app')
        .factory(serviceId, model);

    model.$inject = ['config'];

    function model(config) {
        // Define the functions and properties to reveal
        var entityNames = {
            attendee: 'Person',
            person: 'Person',
            speaker: 'Person',
            session: 'Session',
            room: 'Room',
            track: 'Track',
            timeSlot: 'TimeSlot'
        };

        var service = {
            configureMetadataStore: configureMetadataStore,
            entityNames: entityNames
        };

        return service;

        function configureMetadataStore(metadataStore) {
            registerTimeSlot(metadataStore);
            registerSession(metadataStore);
            registerPerson(metadataStore);
        }

        function registerTimeSlot(metadataStore) {
            metadataStore.registerEntityTypeCtor('TimeSlot', TimeSlot);

            function TimeSlot() { }

            Object.defineProperty(TimeSlot.prototype, 'name', {
                get: function () {
                    var start = this.start;
                    var value = moment.utc(start).format('ddd hh:mm a');

                    return value;
                }
            });
        }

        function registerSession(metadataStore) {
            metadataStore.registerEntityTypeCtor('Session', TimeSlot);

            function TimeSlot() { }

            Object.defineProperty(TimeSlot.prototype, 'tagsFormatted', {
                get: function () {
                    return this.tags ? this.tags.replace(/\|/g, ', ') : this.tags;
                },
                set: function() {
                    this.tags = value.replace(/\, /g, '|');
            }
            });
        }

        function registerPerson(metadataStore) {
            metadataStore.registerEntityTypeCtor('Person', Person);

            function Person() {
                this.isSpeaker = false;
            }

            Object.defineProperty(Person.prototype, 'fullName', {
                get: function () {
                    return this.lastName
                        ? this.firstName + ' ' + this.lastName
                        : this.firstName
                }
            });
        }
    }
})();