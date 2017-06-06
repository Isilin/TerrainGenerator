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

        var generator = {
            renderer: null,
            scene: null,
            clock: null,
            frameDelta: 0,
            paused: true,

            init: function () {
                WebGL.initGL();

                generator.renderer = Renderer;
                generator.scene = Scene;
                generator.clock = new THREE.Clock(false);
            },

            draw: function () {
                generator.renderer.render(generator.scene);
            },

            animate: function () {
                generator.draw();

                generator.frameDelta += generator.clock.getDelta();
                while (generator.frameDelta >= INV_MAX_FPS) {
                    generator.update(INV_MAX_FPS);
                    generator.frameDelta -= INV_MAX_FPS;
                }

                if (!generator.paused) {
                    requestAnimationFrame(generator.animate);
                }
            },

            update: function (delta) {
                generator.scene.update(delta);
            },

            start: function () {
                if (generator.paused) {
                    generator.paused = false;
                    generator.clock.start();
                    requestAnimationFrame(generator.animate);
                }
            },

            stop: function () {
                generator.paused = true;
                generator.camera.disableControls();
                generator.clock.stop();
            }
        };

        return generator;
    }]
)