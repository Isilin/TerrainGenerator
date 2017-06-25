'use strict';

angular.module('terrainGenerator')
    .service('Settings', [ 'WebGL', function (WebGL) {

        var settings = {
            easing: {
                options: [ 'Linear', 'Easeln', 'EalsenWeak', 'EaseOut', 'EaseInOut', 'InEaseOut' ],
                selected: 'Linear'
            },
            heightmap: {
                options: [ 'Brownian', 'Cosine', 'CosineLayers', 'DiamondSquare', 'Fault', 'Heightmap.png', 'Hill',
                            'Hillsland', 'Particles', 'Perlin', 'PerlinDiamond', 'PerlinLayers',
                            'Simplex', 'SimplexLayers', 'Value', 'Weierstrass', 'Worley'],
                selected: 'PerlinDiamond'
            },
            smoothing: {
                options: [ 'Conservative (0.5)', 'Conservative (1)', 'Conservative (10)', 'Gaussian (0.5, 7)',
                            'Gaussian (1.0, 7)', 'Gaussian (1.5, 7)', 'Gaussian (1.0, 5)', 'Gaussian (1.0, 11)',
                            'GaussianBox', 'Mean (0)', 'Mean (1)', 'Mean (8)', 'Median', 'None' ],
                selected: 'None'
            },
            segments: WebGL.existingContext ? 63 : 31,
            steps: 1,
            turbulent: false,
            texture: {
                options: [ 'Blended', 'Grayscale', 'Wireframe' ],
                selected: WebGL.existingContext ? 'Blended' : 'Wireframe'
            },
            scattering: {
                options: [ 'Altitude', 'Linear', 'Cosine', 'CosineLayers', 'DiamondSquare', 'Particles', 'Perlin',
                            'PerlinAltitude', 'Simplex', 'Value', 'Weierstrass', 'Worley' ],
                selected: 'PerlinAltitude'
            },
            spread: 60,
            lightColor: '#e8bdb0',
            size: 1024,
            maxHeight: 200,
            widthLengthRatio: 1.0,
            edgeType: {
                options: [ 'Box', 'Radial' ],
                selected: 'Box'
            },
            direction: {
                options: [ 'Normal', 'Up', 'Down' ],
                selected: 'Normal'
            },
            curve: {
                options: [ 'Linear', 'EaseIn', 'EaseOut', 'EaseInOut' ],
                selected: 'EaseInOut'
            },
            distance: 256,

            after: function (vertices, options) {
                if (settings.direction.selected !== 'Normal') {
                    if (settings.edgeType.selected === 'Box') {
                        THREE.Terrain.Edges(vertices, 
                                            options, 
                                            settings.direction.selected === 'Up',
                                            settings.edgeType === 'Box' ? settings.distance : Math.min(options.xSize, options.ySize) * 0.5 - settings.distance,
                                            THREE.Terrain[settings.curve]);
                    }
                    else {
                        THREE.Terrain.RadialEdges(vertices, 
                                            options, 
                                            settings.direction.selected === 'Up',
                                            settings.edgeType === 'Box' ? settings.distance : Math.min(options.xSize, options.ySize) * 0.5 - settings.distance,
                                            THREE.Terrain[settings.curve]);
                    }
                }
            },
            lastSetup: null,
        };

        return settings;
    }]
);