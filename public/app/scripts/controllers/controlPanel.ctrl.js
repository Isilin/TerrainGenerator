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

        $scope.heightmap = {
            options: [
                'Brownian',
                'Cosine',
                'CosineLayers',
                'DiamondSquare',
                'Fault',
                'Heightmap.png',
                'Hill',
                'Hillsland',
                'Influences',
                'Particles',
                'Perlin',
                'PerlinDiamond',
                'PerlinLayers',
                'Simplex',
                'SimplexLayers',
                'Value',
                'Weierstrass',
                'Worley'
            ],
            selected: 'Brownian'
        };

        $scope.easing = {
            options: [
                'Linear',
                'Easeln',
                'EalsenWeak',
                'EaseOut',
                'EaseInOut',
                'InEaseOut'
            ],
            selected: 'Linear'
        };

        $scope.smoothing = {
            options: [
                'Conservative (0.5)',
                'Conservative (1)',
                'Conservative (10)',
                'Gaussian (0.5, 7)',
                'Gaussian (1.0, 7)',
                'Gaussian (1.5, 7)',
                'Gaussian (1.0, 5)',
                'Gaussian (1.0, 11)',
                'GaussianBox',
                'Mean (0)',
                'Mean (1)',
                'Mean (8)',
                'Median',
                'None'
            ],
            selected: 'None'
        };

        $scope.texture = {
            options: [
                'Blended',
                'Grayscale',
                'Wireframe'
            ],
            selected: 'Blended'
        };

        $scope.scattering = {
            options: [
                'Altitude',
                'Linear',
                'Cosine',
                'CosineLayers',
                'DiamondSquare',
                'Particles',
                'Perlin',
                'PerlinAltitude',
                'Simplex',
                'Value',
                'Weierstrass',
                'Worley'
            ],
            selected: 'Altitude'
        };

        $scope.edgetype = {
            options: [
                'Box',
                'Radial'
            ],
            selected: 'Box'
        };

        $scope.direction = {
            options: [
                'Normal',
                'Up',
                'Down'
            ],
            selected: 'Normal'
        };

        $scope.curve = {
            options: [
                'Linear',
                'EaseIn',
                'EaseOut',
                'EaseInOut'
            ],
            selected: 'Linear'
        }
    }]
);