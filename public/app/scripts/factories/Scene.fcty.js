'use strict';

angular.module('terrainGenerator')
    .factory('Scene', ['Camera', function (Camera) {
        var scene = {
            that: null,
            camera: null,

            skybox: null,
            water: null,
            skylight: null,
            light: null,

            init: function () {
                this.that = new THREE.Scene();
                this.that.fog = new THREE.FogExp2(0x868293, 0.0007);
                
                var textureLoader = new THREE.TextureLoader();
                textureLoader.load('/assets/images/sky1.jpg', function(texture) {
                    texture.minFilter = THREE.LinearFilter; // Texture is not a power-of-two size; use smoother interpolation.
                    scene.skybox = new THREE.Mesh(
                        new THREE.SphereGeometry(8192, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
                        new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, fog: false })
                    );
                    scene.skybox.position.y = -99;
                    scene.that.add(scene.skybox);
                });

                this.water = new THREE.Mesh(
                    new THREE.PlaneBufferGeometry(16384 + 1024, 16384 + 1024, 16, 16),
                    new THREE.MeshLambertMaterial({ color: 0x006ba0, transparent: true, opacity: 0.6 })
                );
                this.water.position.y = -99;
                this.water.rotation.x = -0.5 * Math.PI;
                this.that.add(this.water);

                this.skylight = new THREE.DirectionalLight(0xe8bdb0, 1.5);
                this.skylight.position.set(2950, 2625, -160); // Sun on the sky texture
                this.that.add(this.skylight);
                this.light = new THREE.DirectionalLight(0xc3eaff, 0.75);
                this.light.position.set(-1, -0.5, -1);
                this.that.add(this.light);

                scene.addCamera();
            },

            addCamera: function() {
                scene.camera = Camera;
                scene.that.add(scene.camera.that);
            },

            update: function(delta) {
                this.camera.update(delta);
                this.moveSkybox();
            },

            moveSkybox: function () {
            }
        };

        scene.init();

        return scene;
    }]
);