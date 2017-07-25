import 'three';

import grass from '../../../assets/images/grass1.jpg';
import stone from '../../../assets/images/stone1.jpg';
import sand from '../../../assets/images/sand1.jpg';
import snow from '../../../assets/images/snow1.jpg';

export default class Materials
{
    constructor () {
        this.sand = null;
        this.water = null;
        this.blend = new THREE.MeshBasicMaterial({ color: 0x5566aa, wireframe: true });
        this.mat = new THREE.MeshBasicMaterial({ color: 0x5566aa, wireframe: true });
        this.gray = new THREE.MeshPhongMaterial({ color: 0x88aaaa, specular: 0x444455, shininess: 10 });
    }

    init (callback) {
        this.water = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(16384 + 1024, 16384 + 1024, 16, 16),
            new THREE.MeshLambertMaterial({ color: 0x006ba0, transparent: true, opacity: 0.6 })
        );
        this.water.position.y = -99;
        this.water.rotation.x = -0.5 * Math.PI;
        var loader = new THREE.TextureLoader();

        var that = this;
        loader.load(sand, function (t1) {
            t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
            that.sand = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(16384 + 1024, 16384 + 1024, 64, 64),
                new THREE.MeshLambertMaterial({ map: t1 })
            );
            that.sand.position.y = -101;
            that.sand.rotation.x = -0.5 * Math.PI;
            loader.load(grass, function (t2) {
                t2.wrapS = t2.wrapT = THREE.RepeatWrapping;
                loader.load(stone, function (t3) {
                    t3.wrapS = t3.wrapT = THREE.RepeatWrapping;
                    loader.load(snow, function (t4) {
                        t4.wrapS = t4.wrapT = THREE.RepeatWrapping;
                        /* t2.repeat.x = t2.repeat.y = 2;*/
                        that.blend = THREE.Terrain.generateBlendedMaterial([
                            { texture: t1 },
                            { texture: t2, levels: [-80, -35, 20, 50] },
                            { texture: t3, levels: [20, 50, 60, 85] },
                            { texture: t4, glsl: '1.0 - smoothstep(65.0 + smoothstep(-256.0, 256.0, vPosition.x) * 10.0, 80.0, vPosition.z)' },
                            { texture: t3, glsl: 'slope > 0.7853981633974483 ? 0.2 : 1.0 - smoothstep(0.47123889803846897, 0.7853981633974483, slope) + 0.2' }, /* between 27 and 45 degrees */
                        ]);
                        callback();
                    });
                });
            });
        })
    }
};