'use strict';

angular.module('terrainGenerator')
    .service('Generator', [
        'WebGL', 
        'Scene', 
        'Renderer', 
        'Camera', 
        'Settings',
        function (WebGL, Scene, Renderer, Camera, Settings) {
            const INV_MAX_FPS = 1 / 100;

            this.renderer = null;
            this.scene = null;
            this.clock = null;
            this.frameDelta = 0;
            this.paused = true;

            var that = this;

            this.init = function () {
                WebGL.initGL();

                that.renderer = Renderer;
                that.scene = Scene;
                that.clock = new THREE.Clock(false);
            };

            this.draw = function () {
                that.renderer.render(that.scene);
            };

            this.animate = function () {
                that.draw();

                that.frameDelta += that.clock.getDelta();
                while (that.frameDelta >= INV_MAX_FPS) {
                    that.update(INV_MAX_FPS);
                    that.frameDelta -= INV_MAX_FPS;
                }

                if (!that.paused) {
                    requestAnimationFrame(that.animate);
                }
            };

            this.update = function (delta) {
                that.scene.update(delta);
            };

            this.start = function () {
                if (that.paused) {
                    that.paused = false;
                    that.clock.start();
                    requestAnimationFrame(that.animate);
                }
            };

            this.stop = function () {
                that.paused = true;
                that.camera.disableControls();
                that.clock.stop();
            };
        }
    ]
)