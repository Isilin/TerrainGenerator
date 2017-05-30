'use strict';

angular.module('terrainGenerator')
    .controller('GeneratorCtrl', ['$scope', 'WebGL', function ($scope, WebGL) {
        WebGL.initGL();
    }]
);