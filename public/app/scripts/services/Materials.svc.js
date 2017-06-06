'use strict';

angular.module('terrainGenerator')
    .service('Materials', function () {
        var materials = {
            sand: null,
            water: null,
            blend: null,
            mat: new THREE.MeshBasicMaterial({ color: 0x5566aa, wireframe: true }),
            gray: new THREE.MeshPhongMaterial({ color: 0x88aaaa, specular: 0x444455, shininess: 10 }),

            init: function (callback) {
                materials.water = new THREE.Mesh(
                    new THREE.PlaneBufferGeometry(16384 + 1024, 16384 + 1024, 16, 16),
                    new THREE.MeshLambertMaterial({ color: 0x006ba0, transparent: true, opacity: 0.6 })
                );
                materials.water.position.y = -99;
                materials.water.rotation.x = -0.5 * Math.PI;
                var loader = new THREE.TextureLoader();
                loader.load('/assets/images/sand1.jpg', function (t1) {
                    t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
                    materials.sand = new THREE.Mesh(
                        new THREE.PlaneBufferGeometry(16384 + 1024, 16384 + 1024, 64, 64),
                        new THREE.MeshLambertMaterial({ map: t1 })
                    );
                    materials.sand.position.y = -101;
                    materials.sand.rotation.x = -0.5 * Math.PI;
                    loader.load('/assets/images/grass1.jpg', function (t2) {
                        t2.wrapS = t2.wrapT = THREE.RepeatWrapping;
                        loader.load('/assets/images/stone1.jpg', function (t3) {
                            t3.wrapS = t3.wrapT = THREE.RepeatWrapping;
                            loader.load('/assets/images/snow1.jpg', function (t4) {
                                t4.wrapS = t4.wrapT = THREE.RepeatWrapping;
                                // t2.repeat.x = t2.repeat.y = 2;
                                materials.blend = THREE.Terrain.generateBlendedMaterial([
                                    { texture: t1 },
                                    { texture: t2, levels: [-80, -35, 20, 50] },
                                    { texture: t3, levels: [20, 50, 60, 85] },
                                    { texture: t4, glsl: '1.0 - smoothstep(65.0 + smoothstep(-256.0, 256.0, vPosition.x) * 10.0, 80.0, vPosition.z)' },
                                    { texture: t3, glsl: 'slope > 0.7853981633974483 ? 0.2 : 1.0 - smoothstep(0.47123889803846897, 0.7853981633974483, slope) + 0.2' }, // between 27 and 45 degrees
                                ]);
                                callback();
                            });
                        });
                    });
                })
            }
        };

        return materials;
    }
);