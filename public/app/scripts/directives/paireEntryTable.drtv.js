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
            controller: ['$scope','$attrs', 'stats', function ($scope, $attrs, stats) {
                $scope.name = $attrs.name;
                $scope.value = $attrs.value;
                $scope.stats = stats;
            }]
        }
    }
);