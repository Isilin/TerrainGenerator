'use strict';

angular.module('terrainGenerator')
    .service('app', [
        'WebGL',
        'Settings',
        'MathHelper',
        function (WebGL, Settings, MathHelper) {

        var player,
        var useFPS = false;

        app.setup = function () {
            watchFocus();
            setupDatGui();
            startAnimating();
        }

        function setupDatGui() {
            var heightmapImage = new Image();
            heightmapImage.src = '/assets/images/heightmap.png';

            function Settings() {
                var that = this;
                var elevationGraph = document.getElementById('elevation-graph'),
                    slopeGraph = document.getElementById('slope-graph'),
                    analyticsValues = document.getElementsByClassName('value');
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
            }
            var settings = new Settings();
        }

        function cleanAnalytic(val) {
            if (Array.isArray(val)) {
                if (val.length === 1) {
                    val = val[0];
                }
                else {
                    var str = val.map(function (v) { return Math.round(v); }).join(', ');
                    if (str.length > 9) str = val.join(',');
                    if (str.length > 9) str = str.substring(0, str.lastIndexOf(',', 7)) + ',&hellip;';
                    return str;
                }
            }
            var valIntStr = (val | 0) + '',
                c = '';
            if ((val | 0) === 0 && val < 0) {
                valIntStr = '-' + valIntStr;
            }
            while (valIntStr.length + c.length < 5) {
                c += ' ';
            }
            return c + MathHelper.round(val, 3);
        }

        var moments = {
            'elevation.stdev': {
                mean: 42.063,
                stdev: 6.353,
            },
            'elevation.pearsonSkew': {
                // mean: 0.100,
                // stdev: 0.566,
                levels: {
                    '+high': -1.032,
                    '+medium': -0.277,
                    'low': 0.666,
                    '-medium': 1.232,
                    '-high': Infinity,
                },
            },
            'slope.stdev': {
                mean: 10.154,
                stdev: 3.586,
            },
            'slope.groeneveldMeedenSkew': {
                // mean: -0.021,
                // stdev: 0.163,
                levels: {
                    '+high': -0.347,
                    '+medium': -0.130,
                    'low': 0.088,
                    '-medium': 0.305,
                    '-high': Infinity,
                },
            },
            'roughness.jaggedness': {
                levels: [0.006, 0.02, 0.044, 0.10],
            },
            'roughness.terrainRuggednessIndex': {
                levels: [1, 2.2, 3.5, 4.8],
            },
        };

        function getSummary(analytics) {
            var results = {},
                deviationBuckets = [-2, -2 / 3, 2 / 3, 2];
            for (var prop in moments) {
                if (moments.hasOwnProperty(prop)) {
                    var averageProp = moments[prop],
                        split = prop.split('.'),
                        sampleProp = analytics[split[0]][split[1]];
                    if (typeof averageProp.mean === 'number') {
                        results[prop] = (sampleProp - averageProp.mean) / averageProp.stdev;
                        results[prop] = numberToCategory(results[prop], deviationBuckets);
                    }
                    else {
                        results[prop] = numberToCategory(sampleProp, averageProp.levels);
                    }
                }
            }
            return results;
        }

        /**
         * Classify a numeric input.
         *
         * @param {Number} value
         *   The number to classify.
         * @param {Object/Number[]} [buckets=[-2, -2/3, 2/3, 2]]
         *   An object or numeric array used to classify `value`. If `buckets` is an
         *   array, the returned category will be the first of "very low," "low,"
         *   "medium," and "high," in that order, where the correspondingly ordered
         *   bucket value is higher than the `value` being classified, or "very high"
         *   if all bucket values are smaller than the `value` being classified. If
         *   `buckets` is an object, its values will be sorted, and the returned
         *   category will be the key of the first bucket value that is higher than the
         *   `value` being classified, or the key of the highest bucket value if the
         *   `value` being classified is higher than all the values in `buckets`.
         *
         * @return {String}
         *   The category into which the numeric input was classified.
         */
        function numberToCategory(value, buckets) {
            if (!buckets) {
                buckets = [-2, -2 / 3, 2 / 3, 2];
            }
            if (typeof buckets.length === 'number' && buckets.length > 3) {
                if (value < buckets[0]) return 'very low';
                if (value < buckets[1]) return 'low';
                if (value < buckets[2]) return 'medium';
                if (value < buckets[3]) return 'high';
                if (value >= buckets[3]) return 'very high';
            }
            var keys = Object.keys(buckets).sort(function (a, b) {
                return buckets[a] - buckets[b];
            }),
                l = keys.length;
            for (var i = 0; i < l; i++) {
                if (value < buckets[keys[i]]) {
                    return keys[i];
                }
            }
            return keys[l - 1];
        }

        return app;
    }]
);