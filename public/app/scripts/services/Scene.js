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
        this._terrain = this._terrainFactory.newTerrain();
        this.add(this._terrain.object);
        /* ################### */

        /* ##### SKYDOME ##### */
        var sdGeometry = new THREE.SphereGeometry(8192, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        var loader = new THREE.TextureLoader();
        var sdMaterial = new THREE.MeshPhongMaterial({
            map: loader.load('/assets/images/sky1.jpg'),
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
        var sun = new THREE.DirectionalLight(0xffff66, 1.5);
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
        this.remove(this._terrain.object);
        delete this._terrain;
        this._terrain = this._terrainFactory.newTerrain();
        this.add(this._terrain.object);
    }
};