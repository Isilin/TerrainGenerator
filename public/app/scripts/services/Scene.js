import 'three';
import 'three.terrain.js';

import sky from '../../../assets/images/sky1.jpg';

export default class Scene extends THREE.Scene
{
    /*@ngInject*/
    constructor (Camera, TerrainFactory, Settings, Materials) {
        super();
        this.fog = new THREE.FogExp2(0x868293, 0.0002);

        this.$settings = Settings;
        this.$materials = Materials;

        this._camera = Camera;

        /* ##### TERRAIN ##### */
        this._terrainFactory = TerrainFactory;
        this._terrain = null;
        this.refreshTerrain();
        /* ################### */

        /* ##### SKYDOME ##### */
        var sdGeometry = new THREE.SphereGeometry(8192, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        var loader = new THREE.TextureLoader();
        var sdMaterial = new THREE.MeshPhongMaterial({
            map: loader.load(sky),
            fog: false,
            side: THREE.BackSide
        });
        this._skydome = new THREE.Mesh(sdGeometry, sdMaterial);
        this._skydome.position.y = -99;
        this.add(this._skydome);
        /* ################### */
        
        /* ##### AMBIENT LIGHT ##### */
        this.add(new THREE.AmbientLight(0xe0e0e0));
        /* ######################### */
        
        /* ##### SUN ##### */
        var sun = new THREE.DirectionalLight(0xdddd66, 1.5);
        sun.position.set(2950, 2625, -160);
        this.add(sun);
        /* ############### */
    }

    get camera () { return this._camera; }

    update(delta) { this._camera.update(delta); }

    updateSmoothing (smoothing, lastSetup) {
        this.$settings.lastSetup = lastSetup;
        this._terrain.smooth(smoothing);
    }

    updateScattering () {
        this._terrain.scatter();
    }

    refreshTerrain() {
        if(this._terrain != null) {
            this.remove(this._terrain.object);
            delete this._terrain;
        }
        var heightmapCanvas = document.getElementById('heightmap');

        this._terrain = this._terrainFactory.newTerrain();
        this.add(this._terrain.object);
        var options = this._terrain.options;
        options.heightmap = heightmapCanvas;
        THREE.Terrain.toHeightmap(this._terrain._object3D.children[0].geometry.vertices, options);
    }
};