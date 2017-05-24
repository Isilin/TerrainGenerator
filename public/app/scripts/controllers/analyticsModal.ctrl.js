'use strict';

angular.module('terrainGenerator')
    .controller('analyticsModalCtrl', [
        '$scope',
        '$uibModal',
        'stats',
        ($scope, $uibModal, stats) => {
            $scope.stats = stats;

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