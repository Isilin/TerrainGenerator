'use strict';

angular.module('terrainGenerator')
    .factory('stats', () => {
        var stats = {
            "elevation": {
                "stdev": 0,
                "pearsonSkew": 0,
                "sampleSize": 0,
                "min": 0,
                "max": 0,
                "range": 0,
                "midrange": 0,
                "median": 0,
                "iqr": 0,
                "mean": 0,
                "mad": 0,
                "modes": 0,
                "groeneveldMeedenSkew": 0,
                "kurtosis": 0
            },
            "roughness": {
                "jaggedness": 0,
                "terrainRuggednessIndex": 0,
                "planimetricAreaRatio": 0
            },
            "slope": {
                "stdev": 0,
                "groeneveldMeedenSkew": 0,
                "sampleSize": 0,
                "min": 0,
                "max": 0,
                "range": 0,
                "midrange": 0,
                "median": 0,
                "iqr": 0,
                "mean": 0,
                "mad": 0,
                "modes": 0,
                "pearsonSkew": 0,
                "kurtosis": 0
            },
            "fittedPlane": {
                "slope": 0,
                "pctExplained": 0
            }
        };

        return stats;
    }
);