'use strict';

angular.module('terrainGenerator')
    .factory('Settings', [ 'WebGL', function (WebGL) {

        var settings = {
            easing: 'Linear',
            heightmap: 'PerlinDiamond',
            smoothing: 'None',
            maxHeight: 200,
            segments: WebGL.existingContext ? 63 : 31,
            steps: 1,
            /*this.turbulent = false;
            this.size = 1024;
            this.sky = true;
            this.texture = WebGL.existingContext ? 'Blended' : 'Wireframe';
            this.edgeDirection = 'Normal';
            this.edgeType = 'Box';
            this.edgeDistance = 256;
            this.edgeCurve = 'EaseInOut';
            this['width:length ratio'] = 1.0;
            this['Flight mode'] = useFPS;
            this['Light color'] = '#' + skyLight.color.getHexString();
            this.spread = 60;
            this.scattering = 'PerlinAltitude';

            var that = this;
            var mat = new THREE.MeshBasicMaterial({ color: 0x5566aa, wireframe: true });
            var gray = new THREE.MeshPhongMaterial({ color: 0x88aaaa, specular: 0x444455, shininess: 10 });
            var blend;
            var elevationGraph = document.getElementById('elevation-graph'),
                slopeGraph = document.getElementById('slope-graph'),
                analyticsValues = document.getElementsByClassName('value');
            THREE.ImageUtils.loadTexture('/assets/images/sand1.jpg', undefined, function (t1) {
                t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
                sand = new THREE.Mesh(
                    new THREE.PlaneBufferGeometry(16384 + 1024, 16384 + 1024, 64, 64),
                    new THREE.MeshLambertMaterial({ map: t1 })
                );
                sand.position.y = -101;
                sand.rotation.x = -0.5 * Math.PI;
                scene.add(sand);
                THREE.ImageUtils.loadTexture('/assets/images/grass1.jpg', undefined, function (t2) {
                    t2.wrapS = t2.wrapT = THREE.RepeatWrapping;
                    THREE.ImageUtils.loadTexture('/assets/images/stone1.jpg', undefined, function (t3) {
                        t3.wrapS = t3.wrapT = THREE.RepeatWrapping;
                        THREE.ImageUtils.loadTexture('/assets/images/snow1.jpg', undefined, function (t4) {
                            t4.wrapS = t4.wrapT = THREE.RepeatWrapping;
                            // t2.repeat.x = t2.repeat.y = 2;
                            blend = THREE.Terrain.generateBlendedMaterial([
                                { texture: t1 },
                                { texture: t2, levels: [-80, -35, 20, 50] },
                                { texture: t3, levels: [20, 50, 60, 85] },
                                { texture: t4, glsl: '1.0 - smoothstep(65.0 + smoothstep(-256.0, 256.0, vPosition.x) * 10.0, 80.0, vPosition.z)' },
                                { texture: t3, glsl: 'slope > 0.7853981633974483 ? 0.2 : 1.0 - smoothstep(0.47123889803846897, 0.7853981633974483, slope) + 0.2' }, // between 27 and 45 degrees
                            ]);
                            that.Regenerate();
                        });
                    });
                });
            });
            this.easing = 'Linear';
            this.heightmap = 'PerlinDiamond';
            this.smoothing = 'None';
            this.maxHeight = 200;
            this.segments = WebGL.existingContext ? 63 : 31;
            this.steps = 1;
            this.turbulent = false;
            this.size = 1024;
            this.sky = true;
            this.texture = WebGL.existingContext ? 'Blended' : 'Wireframe';
            this.edgeDirection = 'Normal';
            this.edgeType = 'Box';
            this.edgeDistance = 256;
            this.edgeCurve = 'EaseInOut';
            this['width:length ratio'] = 1.0;
            this['Flight mode'] = useFPS;
            this['Light color'] = '#' + skyLight.color.getHexString();
            this.spread = 60;
            this.scattering = 'PerlinAltitude';
            this.after = function (vertices, options) {
                if (that.edgeDirection !== 'Normal') {
                    (that.edgeType === 'Box' ? THREE.Terrain.Edges : THREE.Terrain.RadialEdges)(
                        vertices,
                        options,
                        that.edgeDirection === 'Up' ? true : false,
                        that.edgeType === 'Box' ? that.edgeDistance : Math.min(options.xSize, options.ySize) * 0.5 - that.edgeDistance,
                        THREE.Terrain[that.edgeCurve]
                    );
                }
            };
            window.rebuild = this.Regenerate = function () {
                var s = parseInt(that.segments, 10),
                    h = that.heightmap === 'heightmap.png';
                var o = {
                    after: that.after,
                    easing: THREE.Terrain[that.easing],
                    heightmap: h ? heightmapImage : (that.heightmap === 'influences' ? customInfluences : THREE.Terrain[that.heightmap]),
                    material: that.texture == 'Wireframe' ? mat : (that.texture == 'Blended' ? blend : gray),
                    maxHeight: that.maxHeight - 100,
                    minHeight: -100,
                    steps: that.steps,
                    stretch: true,
                    turbulent: that.turbulent,
                    useBufferGeometry: false,
                    xSize: that.size,
                    ySize: Math.round(that.size * that['width:length ratio']),
                    xSegments: s,
                    ySegments: Math.round(s * that['width:length ratio']),
                    _mesh: typeof terrainScene === 'undefined' ? null : terrainScene.children[0], // internal only
                };
                scene.remove(terrainScene);
                terrainScene = THREE.Terrain(o);
                applySmoothing(that.smoothing, o);
                scene.add(terrainScene);
                skyDome.visible = sand.visible = water.visible = that.texture != 'Wireframe';
                var he = document.getElementById('heightmap');
                if (he) {
                    o.heightmap = he;
                    THREE.Terrain.toHeightmap(terrainScene.children[0].geometry.vertices, o);
                }
                that['Scatter meshes']();
                lastOptions = o;

                var analysis = THREE.Terrain.Analyze(terrainScene.children[0], o),
                    deviations = getSummary(analysis),
                    prop;
                analysis.elevation.drawHistogram(elevationGraph, 10);
                analysis.slope.drawHistogram(slopeGraph, 10);
                for (var i = 0, l = analyticsValues.length; i < l; i++) {
                    prop = analyticsValues[i].getAttribute('data-property').split('.');
                    var analytic = analysis[prop[0]][prop[1]];
                    if (analyticsValues[i].getAttribute('class').split(/\s+/).indexOf('percent') !== -1) {
                        analytic *= 100;
                    }
                    analyticsValues[i].textContent = cleanAnalytic(analytic);
                }
                for (prop in deviations) {
                    if (deviations.hasOwnProperty(prop)) {
                        document.querySelector('.summary-value[data-property="' + prop + '"]').textContent = deviations[prop];
                    }
                }
            };
            function altitudeProbability(z) {
                if (z > -80 && z < -50) return THREE.Terrain.EaseInOut((z + 80) / (-50 + 80)) * that.spread * 0.002;
                else if (z > -50 && z < 20) return that.spread * 0.002;
                else if (z > 20 && z < 50) return THREE.Terrain.EaseInOut((z - 20) / (50 - 20)) * that.spread * 0.002;
                return 0;
            }
            this.altitudeSpread = function (v, k) {
                return k % 4 === 0 && Math.random() < altitudeProbability(v.z);
            };
            var mesh = buildTree();
            var decoMat = mesh.material.clone(); // new THREE.MeshBasicMaterial({color: 0x229966, wireframe: true});
            decoMat.materials[0].wireframe = true;
            decoMat.materials[1].wireframe = true;
            this['Scatter meshes'] = function () {
                var s = parseInt(that.segments, 10),
                    spread,
                    randomness;
                var o = {
                    xSegments: s,
                    ySegments: Math.round(s * that['width:length ratio']),
                };
                if (that.scattering === 'Linear') {
                    spread = that.spread * 0.0005;
                    randomness = Math.random;
                }
                else if (that.scattering === 'Altitude') {
                    spread = that.altitudeSpread;
                }
                else if (that.scattering === 'PerlinAltitude') {
                    spread = (function () {
                        var h = THREE.Terrain.ScatterHelper(THREE.Terrain.Perlin, o, 2, 0.125)(),
                            hs = THREE.Terrain.InEaseOut(that.spread * 0.01);
                        return function (v, k) {
                            var rv = h[k],
                                place = false;
                            if (rv < hs) {
                                place = true;
                            }
                            else if (rv < hs + 0.2) {
                                place = THREE.Terrain.EaseInOut((rv - hs) * 5) * hs < Math.random();
                            }
                            return Math.random() < altitudeProbability(v.z) * 5 && place;
                        };
                    })();
                }
                else {
                    spread = THREE.Terrain.InEaseOut(that.spread * 0.01) * (that.scattering === 'Worley' ? 1 : 0.5);
                    randomness = THREE.Terrain.ScatterHelper(THREE.Terrain[that.scattering], o, 2, 0.125);
                }
                var geo = terrainScene.children[0].geometry;
                terrainScene.remove(decoScene);
                decoScene = THREE.Terrain.ScatterMeshes(geo, {
                    mesh: mesh,
                    w: s,
                    h: Math.round(s * that['width:length ratio']),
                    spread: spread,
                    smoothSpread: that.scattering === 'Linear' ? 0 : 0.2,
                    randomness: randomness,
                    maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
                    maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
                });
                if (decoScene) {
                    if (that.texture == 'Wireframe') {
                        decoScene.children[0].material = decoMat;
                    }
                    else if (that.texture == 'Grayscale') {
                        decoScene.children[0].material = gray;
                    }
                    terrainScene.add(decoScene);
                }
            };*/
        };

        return settings;
    }]
);