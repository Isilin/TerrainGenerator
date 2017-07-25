import 'three';

export default class Renderer
{
    /*@ngInject*/
    constructor ($document, $window, Webgl) {
        this._document = $document;
        this._window = $window;
        this._webgl = Webgl;

        var container = this._document[0].getElementById('terrain');
        this._parent = this._webgl.existingContext ? new THREE.WebGLRenderer({ antialias: true, canvas: container }) : new THREE.CanvasRenderer();
        this.resize(this._window.innerWidth, this._window.innerHeight);
        this._parent.domElement.setAttribute('tabindex', -1);
        this._ratio = 0;
    }

    resize (width, height) {
        this._parent.setSize(width, height);
        this._ratio = width / height;
    }

    render (scene) {
        this._parent.render(scene, scene._camera);
    }
};