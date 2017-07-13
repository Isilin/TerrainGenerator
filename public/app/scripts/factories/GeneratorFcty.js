const MAX_FPS = 60;
const FRAMERATE = 1 / MAX_FPS;

export default class Generator
{
    constructor (Webgl, Scene, Renderer) {
        this._renderer = null;
        this._scene = null;
        this._clock = null;
        this._frameDelta = 0;
        this._paused = true;

        this._webgl = Webgl;
        this._scene = Scene;
        this._renderer = Renderer;
    }

    init () {
        this._webgl.initGL();
        this._clock = new THREE.Clock(false);
    }

    draw () {
        this._renderer.render(this._scene);
    }

    animate () {
        this.draw();

        this._frameDelta += this._clock.getDelta();
        while (this._frameDelta >= FRAMERATE) {
            this.update(FRAMERATE);
            this._frameDelta -= FRAMERATE;
        }

        if (!this._paused) {
            requestAnimationFrame(this.animate.bind(this));
        }
    }

    update (delta) {
        this._scene.update(delta);
    }

    start () {
        if (this._paused) {
            this._paused = false;
            this._clock.start();
            requestAnimationFrame(this.animate.bind(this));
        }
    }

    stop () {
        this._paused = true;
        this._clock.stop();
    }
};