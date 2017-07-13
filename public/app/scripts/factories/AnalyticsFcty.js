export default class Analytics
{
    constructor () {
        this.elevation = {
            stdev: 0,
            pearsonSkew: 0,
            sampleSize: 0,
            min: 0,
            max: 0,
            range: 0,
            midrange: 0,
            median: 0,
            iqr: 0,
            mean: 0,
            mad: 0,
            modes: 0,
            groeneveldMeedenSkew: 0,
            kurtosis: 0
        };
        this.roughness = {
            jaggedness: 0,
            terrainRuggednessIndex: 0,
            planimetricAreaRatio: 0
        };
        this.slope = {
            stdev: 0,
            groeneveldMeedenSkew: 0,
            sampleSize: 0,
            min: 0,
            max: 0,
            range: 0,
            midrange: 0,
            median: 0,
            iqr: 0,
            mean: 0,
            mad: 0,
            modes: 0,
            pearsonSkew: 0,
            kurtosis: 0
        };
        this.fittedPlane = {
            slope: 0,
            pctExplained: 0
        };
        this.moments = {
            "elevation.stdev": {
                mean: 42.063,
                stdev: 6.353,
            },
            "elevation.pearsonSkew": {
                /* mean: 0.100,
                stdev: 0.566,*/
                levels: {
                    '+high': -1.032,
                    '+medium': -0.277,
                    'low': 0.666,
                    '-medium': 1.232,
                    '-high': Infinity,
                },
            },
            'slope.stdev': {
                mean: 10.154,
                stdev: 3.586,
            },
            'slope.groeneveldMeedenSkew': {
                /* mean: -0.021,
                stdev: 0.163,*/
                levels: {
                    '+high': -0.347,
                    '+medium': -0.130,
                    'low': 0.088,
                    '-medium': 0.305,
                    '-high': Infinity,
                },
            },
            'roughness.jaggedness': {
                levels: [0.006, 0.02, 0.044, 0.10],
            },
            'roughness.terrainRuggednessIndex': {
                levels: [1, 2.2, 3.5, 4.8],
            }
        };
    }
};
