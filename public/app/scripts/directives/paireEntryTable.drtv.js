'use strict';

angular.module('terrainGenerator')
    .directive('paireEntryTable', () => {
        return {
            templateUrl: '/app/views/paireEntryTable.html',
            restrict: 'A',
            replace: false,
            scope: {
                name: "@name",
                value: "@value"
            },
            controller: ['$scope','$attrs', 'analytics', function ($scope, $attrs, analytics) {
                $scope.name = $attrs.name;
                $scope.value = $attrs.value;
                $scope.analytics = analytics;
            }]
        }
    }
);