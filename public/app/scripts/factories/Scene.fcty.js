'use strict';

angular.module('terrainGenerator')
    .factory('Scene', function () {
        var scene = {
            scene: null,
        };

        scene.scene = new THREE.Scene();
        scene.scene.fog = new THREE.FogExp2(0x868293, 0.0007);

        return scene;
    }
);