import '../../../assets/libs/brownian';
import '../../../assets/libs/gaussian';
import '../../../assets/libs/weightedBoxBlurGaussian';
import '../../../assets/libs/worley';

class Terrain
{
    constructor (Settings, Materials) {
        this.$settings = Settings;
        
        var s = parseInt(this.$settings.segments, 10);
        var h = this.$settings.heightmap.selected === 'heightmap.png';

        var that = this;
        Materials.init(() => {
            that._object3D.children[0].material = that.$settings.texture.selected == 'Wireframe' ? Materials.mat : (that.$settings.texture.selected == 'Blended' ? Materials.blend : Materials.gray)
            that._object3D.children[0].material.needUpdate = true;
        })

        this.options = {
            after: this.$settings.after,
            easing: THREE.Terrain[this.$settings.easing.selected],
            heightmap: h ? heightmapImage : THREE.Terrain[this.$settings.heightmap.selected],
            material: this.$settings.texture.selected == 'Wireframe' ? Materials.mat : (this.$settings.texture.selected == 'Blended' ? Materials.blend : Materials.gray),
            maxHeight: this.$settings.maxHeight - 100,
            minHeight: -100,
            steps: this.$settings.steps,
            stretch: true,
            turbulent: this.$settings.turbulent,
            useBufferGeometry: false,
            xSize: this.$settings.size,
            ySize: Math.round(this.$settings.size * this.$settings.widthLengthRatio),
            xSegments: s,
            ySegments: Math.round(s * this.$settings.widthLengthRatio),
            _mesh: !this._object3D  ? null : this._object3D.children[0], /* internal only */
        };
        delete this._object3D;
        this._object3D = new THREE.Terrain(this.options);
    }

    get options () { return this._options; }
    set options (newOptions) { this._options = newOptions; }

    get object () { return this._object3D; }

    scatter () {
        var s = parseInt(this.$settings.segments, 10);
        var spread;
        var randomness;
        var o = { xSegments: s, ySegments: Math.round(s * this.$settings.widthLengthRatio) };
        if (this.$settings.scattering.selected === 'Linear') {
            spread = this.$settings.spread * 0.0005;
            randomness = Math.random;
        }
        else if (this.$settings.scattering.selected === 'Altitude') {
            spread = this.$settings.altitudeSpread;
        }
        else if (this.$settings.scattering.selected === 'PerlinAltitude') {
            spread = function (v, k) {
                var h = THREE.Terrain.ScatterHelper(THREE.Terrain.Perlin, o, 2, 0.125)(),
                    hs = THREE.Terrain.InEaseOut(this.$settings.spread * 0.01);

                var rv = h[k],
                    place = false;
                if (rv < hs) {
                    place = true;
                }
                else if (rv < hs + 0.2) {
                    place = THREE.Terrain.EaseInOut((rv - hs) * 5) * hs < Math.random();
                }
                return Math.random() < MathHelper.altitudeProbability(v.z) * 5 && place;
            };
        }
        else {
            spread = THREE.Terrain.InEaseOut(this.$settings.spread * 0.01) * (this.$settings.scattering.selected === 'Worley' ? 1 : 0.5);
            randomness = THREE.Terrain.ScatterHelper(THREE.Terrain[this.$settings.scattering.selected], o, 2, 0.125);
        }
    }

    smooth (smoothing) {
        var o = this.options;
        var m = this._object3D.children[0];
        var g = m.geometry.vertices;
        if (smoothing === 'Conservative (0.5)') THREE.Terrain.SmoothConservative(g, o, 0.5);
        if (smoothing === 'Conservative (1)') THREE.Terrain.SmoothConservative(g, o, 1);
        if (smoothing === 'Conservative (10)') THREE.Terrain.SmoothConservative(g, o, 10);
        else if (smoothing === 'Gaussian (0.5, 7)') THREE.Terrain.Gaussian(g, o, 0.5, 7);
        else if (smoothing === 'Gaussian (1.0, 7)') THREE.Terrain.Gaussian(g, o, 1, 7);
        else if (smoothing === 'Gaussian (1.5, 7)') THREE.Terrain.Gaussian(g, o, 1.5, 7);
        else if (smoothing === 'Gaussian (1.0, 5)') THREE.Terrain.Gaussian(g, o, 1, 5);
        else if (smoothing === 'Gaussian (1.0, 11)') THREE.Terrain.Gaussian(g, o, 1, 11);
        else if (smoothing === 'GaussianBox') THREE.Terrain.GaussianBoxBlur(g, o, 1, 3);
        else if (smoothing === 'Mean (0)') THREE.Terrain.Smooth(g, o, 0);
        else if (smoothing === 'Mean (1)') THREE.Terrain.Smooth(g, o, 1);
        else if (smoothing === 'Mean (8)') THREE.Terrain.Smooth(g, o, 8);
        else if (smoothing === 'Median') THREE.Terrain.SmoothMedian(g, o);
        THREE.Terrain.Normalize(m, o);
    }
};

export default class TerrainFactory
{
    constructor (Settings, Materials) {
        this._settings = Settings;
        this._materials = Materials;
    }

    newTerrain () {
        return new Terrain(this._settings, this._materials);
    }
};