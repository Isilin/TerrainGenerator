'use strict';

angular.module('terrainGenerator')
    .controller('ControlPanelCtrl', [
        '$scope', 
        'Settings', 
        'Scene', 
        function ($scope, Settings, Scene) {
            $scope.settings = Settings;

            $scope.getText = function () {
                return $scope.status.menu ? "Close Controls" : "Open Controls";
            };

            $scope.toggle = function () {
                $scope.status.menu = !$scope.status.menu;
            };

            $scope.status = {
                'menu': true,
                'heightmap': {},
                'decoration': {},
                'size': {},
                'edges': {}
            };

            $scope.refresh = function () {
                Scene.refreshTerrain();
            };

            $scope.updateSmoothing = function () {
                Scene.updateSmoothing($scope.settings.smoothing.selected, $scope.settings.lastSetup);
                Scene.updateScattering();
                if ($scope.settings.lastSetup.heightmap) {
                    THREE.Terrain.toHeightmap(Scene.terrain.children[0].geometry.vertices, $scope.settings.lastSetup);
                }
            };

            $scope.updateScattering = function () {
                Scene.updateScattering();
            };

            $scope.updateLightColor = function () {
                Scene.skylight.color.set($scope.settings.lightColor);
            };
        }
    ]
);