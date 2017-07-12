import moduleName from './controllers/controllers';

angular.module('terrainGenerator', [
    'ngRoute',
    'ngAnimate',
    'ngSanitize', 
    'ui.bootstrap',
    moduleName
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