import {default as controllerName} from "./controllers/controllers";

angular.module('terrainGenerator', [
    'ngRoute',
    'ngAnimate',
    'ngSanitize', 
    'ui.bootstrap',
    controllerName
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