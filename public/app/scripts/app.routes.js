'use strict';

angular.module('terrainGenerator', [
    'ngRoute',
    'ngAnimate',
    'ngSanitize', 
    'ui.bootstrap'
  ])
  .config(($routeProvider) => {
    $routeProvider
        .when('terrain', {
            templateUrl: 'views/terrain.html',
            controller: 'terrainCtrl'
        })
        .otherwise({
            redirectTo: 'terrain'
        })
  });