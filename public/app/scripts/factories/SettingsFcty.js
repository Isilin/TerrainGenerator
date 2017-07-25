import '../../../assets/libs/filters';
import 'three.terrain.js';

export default class Settings
{
    constructor (Webgl) {
        this.easing = {
            options: [ 'Linear', 'Easeln', 'EalsenWeak', 'EaseOut', 'EaseInOut', 'InEaseOut' ],
            selected: 'Linear'
        };
        this.heightmap = {
            options: [ 'Brownian', 'Cosine', 'CosineLayers', 'DiamondSquare', 'Fault', 'Heightmap.png', 'Hill',
                        'Hillsland', 'Particles', 'Perlin', 'PerlinDiamond', 'PerlinLayers',
                        'Simplex', 'SimplexLayers', 'Value', 'Weierstrass', 'Worley'],
            selected: 'PerlinDiamond'
        };
        this.smoothing = {
            options: [ 'Conservative (0.5)', 'Conservative (1)', 'Conservative (10)', 'Gaussian (0.5, 7)',
                        'Gaussian (1.0, 7)', 'Gaussian (1.5, 7)', 'Gaussian (1.0, 5)', 'Gaussian (1.0, 11)',
                        'GaussianBox', 'Mean (0)', 'Mean (1)', 'Mean (8)', 'Median', 'None' ],
            selected: 'None'
        };
        this.segments = Webgl.existingContext ? 63 : 31;
        this.steps = 1;
        this.turbulent = false;
        this.texture = {
            options: [ 'Blended', 'Grayscale', 'Wireframe' ],
            selected: Webgl.existingContext ? 'Blended' : 'Wireframe'
        };
        this.scattering = {
            options: [ 'Altitude', 'Linear', 'Cosine', 'CosineLayers', 'DiamondSquare', 'Particles', 'Perlin',
                        'PerlinAltitude', 'Simplex', 'Value', 'Weierstrass', 'Worley' ],
            selected: 'PerlinAltitude'
        };
        this.spread = 60;
        this.lightColor = '#e8bdb0';
        this.size = 1024;
        this.maxHeight = 200;
        this.widthLengthRatio = 1.0;
        this.edgeType = {
            options: [ 'Box', 'Radial' ],
            selected: 'Box'
        };
        this.direction = {
            options: [ 'Normal', 'Up', 'Down' ],
            selected: 'Normal'
        };
        this.curve = {
            options: [ 'Linear', 'EaseIn', 'EaseOut', 'EaseInOut' ],
            selected: 'EaseInOut'
        };
        this.distance = 256;
        this.lastSetup = null;

        var that = this;
        this.after = function (vertices, options) {
            if (that.direction.selected !== 'Normal') {
                if (that.edgeType.selected === 'Box') {
                    THREE.Terrain.Edges(vertices, 
                                        options, 
                                        that.direction.selected === 'Up',
                                        that.edgeType === 'Box' ? that.distance : Math.min(options.xSize, options.ySize) * 0.5 - that.distance,
                                        THREE.Terrain[that.curve]);
                }
                else {
                    THREE.Terrain.RadialEdges(vertices, 
                                        options, 
                                        that.direction.selected === 'Up',
                                        that.edgeType === 'Box' ? that.distance : Math.min(options.xSize, options.ySize) * 0.5 - that.distance,
                                        THREE.Terrain[that.curve]);
                }
            }
        }
    }

    
};