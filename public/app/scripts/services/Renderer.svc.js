'use strict';

angular.module('terrainGenerator')
    .service('Renderer', ['$document', '$window', 'WebGL', function ($document, $window, WebGL) {
        var renderer = {
            _parent: null,
            _ratio: 0,

            init: function () {
                var container = $document[0].getElementById('terrain');
                this._parent = WebGL.existingContext ? new THREE.WebGLRenderer({ antialias: true, canvas: container }) : new THREE.CanvasRenderer();
                this.resize($window.innerWidth, $window.innerHeight);
                this._parent.domElement.setAttribute('tabindex', -1);
            },

            resize: function (width, height) {
                this._parent.setSize(width, height);
                this._ratio = width / height;
            },

            render: function(scene) {
                this._parent.render(scene._parent, scene._camera._parent);
            }
        };

        renderer.init();

        return renderer;
    }]
);