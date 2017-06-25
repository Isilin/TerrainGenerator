'use strict';

class Scene extends THREE.Scene
{
    constructor (Camera, Terrain, Settings, Materials) {
        super();
        this.fog = new THREE.FogExp2(0x868293, 0.0002);

        this.$settings = Settings;
        this.$materials = Materials;

        this._camera = Camera;

        /* ##### TERRAIN ##### */
        this._terrain = Terrain;
        this.add(this._terrain.object);
        /* ################### */

        /* ##### SKYDOME ##### */
        var sdGeometry = new THREE.SphereGeometry(8192, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        var loader = new THREE.TextureLoader();
        var sdMaterial = new THREE.MeshPhongMaterial({
            map: loader.load('/assets/images/sky1.jpg'),
            fog: false,
            side: THREE.BackSide
        });
        var skydome = new THREE.Mesh(sdGeometry, sdMaterial);
        skydome.position.y = -99;
        this.add(skydome);
        /* ################### */
        
        /* ##### AMBIENT LIGHT ##### */
        this.add(new THREE.AmbientLight(0xe0e0e0));
        /* ######################### */
        
        /* ##### SUN ##### */
        var sun = new THREE.DirectionalLight(0xffff66, 1.5);
        sun.position.set(2950, 2625, -160);
        this.add(sun);
        /* ############### */
    }

    get camera () { return this._camera; }

    update(delta) { this._camera.update(delta); }

    refreshTerrain() {
        delete this._terrain;
        this._terrain = Terrain;
    }
}

Scene.$inject = ['Camera', 'Terrain', 'Settings', 'Materials'];
angular.module('terrainGenerator').service('Scene', Scene);

/*
angular.module('terrainGenerator')
    .factory('Scene', [
        'Camera', 
        'Settings', 
        'MathHelper', 
        'Materials', 
        'Renderer',
        function (Settings, MathHelper, Materials, Renderer) {*/
            /*var scene = {
                _parent: null,
                _camera: null,

                _skybox: null,
                _materials: Materials,
                _skylight: null,
                _light: null,
                _terrain: null,

                init: function () {
                    this._parent = new THREE.Scene();
                    this._parent.fog = new THREE.FogExp2(0x868293, 0.0007);
                    
                    var textureLoader = new THREE.TextureLoader();
                    textureLoader.load('/assets/images/sky1.jpg', function(texture) {
                        texture.minFilter = THREE.LinearFilter; // Texture is not a power-of-two size; use smoother interpolation.
                        scene._skybox = new THREE.Mesh(
                            new THREE.SphereGeometry(8192, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
                            new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, fog: false })
                        );
                        scene._skybox.position.y = -99;
                        scene._parent.add(scene._skybox);
                    });
                    
                    this._skylight = new THREE.DirectionalLight(0xe8bdb0, 1.5);
                    this._skylight.position.set(2950, 2625, -160); // Sun on the sky texture
                    this._parent.add(this._skylight);

                    scene.addCamera();

                    Materials.init(function () {
                        scene._parent.add(Materials.sand);
                        scene._parent.add(Materials.water);
                        scene.refreshTerrain();
                    });
                },

                addCamera: function() {
                    scene._camera = Camera;
                    //scene._parent.add(scene._camera._parent);
                },

                update: function(delta) {
                    
                    if (scene._terrain) scene._terrain.rotation.z = Date.now() * 0.0001;
                    this._camera.update(delta);
                    this.moveSkybox();
                },

                moveSkybox: function () {
                },

                refreshTerrain: function () {
                    var s = parseInt(Settings.segments, 10),
                        h = Settings.heightmap.selected === 'heightmap.png';
                    var o = {
                        after: Settings.after,
                        easing: THREE.Terrain[Settings.easing.selected],
                        heightmap: h ? heightmapImage : THREE.Terrain[Settings.heightmap.selected],
                        material: Settings.texture.selected == 'Wireframe' ? mat : (Settings.texture.selected == 'Blended' ? scene._materials.blend : gray),
                        maxHeight: Settings.maxHeight - 100,
                        minHeight: -100,
                        steps: Settings.steps,
                        stretch: true,
                        turbulent: Settings.turbulent,
                        useBufferGeometry: false,
                        xSize: Settings.size,
                        ySize: Math.round(Settings.size * Settings.widthLengthRatio),
                        xSegments: s,
                        ySegments: Math.round(s * Settings.widthLengthRatio),
                        _mesh: !scene._terrain  ? null : scene._terrain.children[0], // internal only
                    };
                    scene._parent.remove(scene._terrain);
                    scene._terrain = THREE.Terrain(o);
                    scene.updateSmoothing(Settings.smoothing, o);
                    scene._parent.add(scene._terrain);
                    scene._skybox.visible = Materials.sand.visible = Materials.water.visible = Settings.texture.selected != 'Wireframe';

                    var he = document.getElementById('heightmap');
                    if (he) {
                        o.heightmap = he;
                        THREE.Terrain.toHeightmap(scene._terrain.children[0].geometry.vertices, o);
                    }

                    scene.updateScattering();
                    Settings.lastSetup = o;
                },

                updateScattering: function() {
                    var s = parseInt(Settings.segments, 10);
                    var spread;
                    var randomness;
                    var o = { xSegments: s, ySegments: Math.round(s * Settings.widthLengthRatio) };
                    if (Settings.scattering.selected === 'Linear') {
                        spread = Settings.spread * 0.0005;
                        randomness = Math.random;
                    }
                    else if (Settings.scattering.selected === 'Altitude') {
                        spread = Settings.altitudeSpread;
                    }
                    else if (Settings.scattering.selected === 'PerlinAltitude') {
                        spread = function (v, k) {
                            var h = THREE.Terrain.ScatterHelper(THREE.Terrain.Perlin, o, 2, 0.125)(),
                                hs = THREE.Terrain.InEaseOut(Settings.spread * 0.01);

                            var rv = h[k],
                                place = false;
                            if (rv < hs) {
                                place = true;
                            }
                            else if (rv < hs + 0.2) {
                                place = THREE.Terrain.EaseInOut((rv - hs) * 5) * hs < Math.random();
                            }
                            return Math.random() < MathHelper.altitudeProbability(v.z) * 5 && place;
                        };
                    }
                    else {
                        spread = THREE.Terrain.InEaseOut(Settings.spread * 0.01) * (Settings.scattering.selected === 'Worley' ? 1 : 0.5);
                        randomness = THREE.Terrain.ScatterHelper(THREE.Terrain[Settings.scattering.selected], o, 2, 0.125);
                    }
                },

                updateSmoothing: function(smoothing, o) {
                    var m = scene._terrain.children[0];
                    var g = m.geometry.vertices;
                    if (smoothing === 'Conservative (0.5)') THREE.Terrain.SmoothConservative(g, o, 0.5);
                    if (smoothing === 'Conservative (1)') THREE.Terrain.SmoothConservative(g, o, 1);
                    if (smoothing === 'Conservative (10)') THREE.Terrain.SmoothConservative(g, o, 10);
                    else if (smoothing === 'Gaussian (0.5, 7)') THREE.Terrain.Gaussian(g, o, 0.5, 7);
                    else if (smoothing === 'Gaussian (1.0, 7)') THREE.Terrain.Gaussian(g, o, 1, 7);
                    else if (smoothing === 'Gaussian (1.5, 7)') THREE.Terrain.Gaussian(g, o, 1.5, 7);
                    else if (smoothing === 'Gaussian (1.0, 5)') THREE.Terrain.Gaussian(g, o, 1, 5);
                    else if (smoothing === 'Gaussian (1.0, 11)') THREE.Terrain.Gaussian(g, o, 1, 11);
                    else if (smoothing === 'GaussianBox') THREE.Terrain.GaussianBoxBlur(g, o, 1, 3);
                    else if (smoothing === 'Mean (0)') THREE.Terrain.Smooth(g, o, 0);
                    else if (smoothing === 'Mean (1)') THREE.Terrain.Smooth(g, o, 1);
                    else if (smoothing === 'Mean (8)') THREE.Terrain.Smooth(g, o, 8);
                    else if (smoothing === 'Median') THREE.Terrain.SmoothMedian(g, o);
                    THREE.Terrain.Normalize(m, o);
                }
            };*/

            /*scene.init();

            return scene;*/
/*            return new Scene(Camera, Terrain, Settings, Materials);
        }
    ]
);*/