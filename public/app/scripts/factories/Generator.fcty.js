'use strict';

angular.module('terrainGenerator')
    .factory('Generator', [
        'WebGL', 
        'Scene', 
        'Renderer',
        function (WebGL, Scene, Renderer) {
            const MAX_FPS = 60;
            const FRAMERATE = 1 / MAX_FPS;

            return {
                _renderer: null,
                _scene: null,
                _clock: null,
                _frameDelta: 0,
                _paused: true,

                init: function () {
                    WebGL.initGL();

                    this._renderer = Renderer;
                    this._scene = Scene;
                    this._clock = new THREE.Clock(false);
                },

                draw: function () {
                   this._renderer.render(this._scene);
                },

                animate: function () {
                    this.draw();

                    this._frameDelta += this._clock.getDelta();
                    while (this._frameDelta >= FRAMERATE) {
                        this.update(FRAMERATE);
                        this._frameDelta -= FRAMERATE;
                    }

                    if (!this._paused) {
                        requestAnimationFrame(this.animate.bind(this));
                    }
                },

                update: function (delta) {
                    this._scene.update(delta);
                },

                start: function () {
                    if (this._paused) {
                        this._paused = false;
                        this._clock.start();
                        requestAnimationFrame(this.animate.bind(this));
                    }
                },

                stop: function () {
                    this._paused = true;
                    this._clock.stop();
                },
            }
        }
    ]
)