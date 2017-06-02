'use strict';

angular.module('terrainGenerator')
    .service('Renderer', ['$document', '$window', 'WebGL', function ($document, $window, WebGL) {
        var renderer = {
            that: null,

            init: function () {
                var container = $document[0].getElementById('terrain');
                this.that = WebGL.existingContext ? new THREE.WebGLRenderer({ antialias: true, canvas: container }) : new THREE.CanvasRenderer();
                this.that.setSize($window.innerWidth, $window.innerHeight);
                this.that.domElement.setAttribute('tabindex', -1);
            },

            resize: function (width, height) {
                this.that.setSize(width, height);
            },

            render: function(scene) {
                this.that.render(scene.that, scene.camera.that);
            }
        };

        renderer.init();

        return renderer;
    }]
);