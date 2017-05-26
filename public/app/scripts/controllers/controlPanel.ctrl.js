'use strict';

angular.module('terrainGenerator')
    .controller('controlPanelCtrl', ['$scope', function ($scope) {
        $scope.getText = function () {
            return $scope.status.menu ? "Close Controls" : "Open Controls";
        };

        $scope.toggle = function () {
            $scope.status.menu = !$scope.status.menu;
        }

        $scope.status = {
            'menu': true,
            'heightmap': {},
            'decoration': {},
            'size': {},
            'edges': {}
        };
    }]
);