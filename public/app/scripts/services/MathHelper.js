import 'three.terrain.js';

export default class MathHelper
{
    constructor () {
    }

    /**
     * Utility method to round numbers to a given number of decimal places.
     *
     * Usage:
     *   round(3.5, 0) // 4
     *   round(Math.random(), 4) // 0.8179
     *   var a = 5532; round(a, -2) // 5500
     *   round(12345.6, -1) // 12350
     *   round(32., -1) // 30
     */
    round (v, a) {
        if (typeof a === 'undefined') {
            a = v;
            v = this;
        }
        if (!a) a = 0;
        var m = Math.pow(10, a | 0);
        return Math.round(v * m) / m;
    }

    altitudeProbability (spread, z) {
        if (z > -80 && z < -50) return THREE.Terrain.EaseInOut((z + 80) / (-50 + 80)) * spread * 0.002;
        else if (z > -50 && z < 20) return spread * 0.002;
        else if (z > 20 && z < 50) return THREE.Terrain.EaseInOut((z - 20) / (50 - 20)) * spread * 0.002;
        return 0;
    };
        
    altitudeSpread (spread, v, k) {
        return k % 4 === 0 && Math.random() < mathHelper.altitudeProbability(spread, v.z);
    };

    radians (degrees) {
        return degrees * Math.PI / 180;
    };
        
    degrees (radians) {
        return radians * 180 / Math.PI;
    }

    isNumber (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
};