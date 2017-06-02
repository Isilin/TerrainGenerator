'use strict';

angular.module('terrainGenerator')
    .service('WebGL', ['$window', function ($window) {
        var webGL = {}

        var isExistingContext = function () { 
            try { 
                var canvas = document.createElement( 'canvas' ); 
                return !!window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); 
            } 
            catch( e ) { 
                return false; 
            } 
        };
        webGL.existingContext = isExistingContext();

        var alertNoGL = function () {
            if (!webGL.existingContext) {
                alert('Your browser does not appear to support WebGL. You can try viewing this page anyway, but it may be slow and some things may not look as intended. Please try viewing on desktop Firefox or Chrome.');
            }
        };

        var checkDisablingGL = function () {
            if (/&?webgl=0\b/g.test(location.hash)) {
                webGL.existingContext = !confirm('Are you sure you want to disable WebGL on this page?');
                if (webGL.existingContext) {
                    location.hash = '#';
                }
            }
        };

        webGL.initGL = function() {
            alertNoGL();
            checkDisablingGL();

            // Workaround: in Chrome, if a page is opened with window.open(),
            // window.innerWidth and window.innerHeight will be zero.
            if ($window.innerWidth === 0) {
                $window.innerWidth = $window.parent.innerWidth;
                $window.innerHeight = $window.parent.innerHeight;
            }
        };

        return webGL;
    }]
);