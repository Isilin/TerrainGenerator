'use strict';

angular.module('terrainGenerator')
    .controller('modalCtrl', [
        '$scope',
        '$uibModal',
        'stats',
        ($scope, $uibModal, stats) => {
            $scope.stats = stats;
            console.log($scope.stats);

            $scope.$onInit = function () {
            };

            $scope.close = function () {
                $scope.$parent.$close();
            };
        }
    ]
);