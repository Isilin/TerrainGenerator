'use strict';

angular.module('terrainGenerator')
    .controller('AnalyticsModalCtrl', [
        '$scope',
        'analytics',
        function ($scope, analytics) {
            $scope.analytics = analytics;

            $scope.isElevationCollapsed = true;
            $scope.isSlopeCollapsed = true;

            $scope.toggleElevation = function () {
                $scope.isElevationCollapsed = !$scope.isElevationCollapsed;
            };

            $scope.toggleSlope = function () {
                $scope.isSlopeCollapsed = !$scope.isSlopeCollapsed;
            };

            $scope.close = function () {
                $scope.$parent.$close();
            };
        }
    ]
);