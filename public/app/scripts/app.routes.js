import * as angular from '../../../bower_components/angular/angular.min';
import "../../../bower_components/boostrap/dist/js/bootstrap.min";
import "../../../bower_components/angular-route/angular-route.min";
import "../../../bower_components/angular-animate/angular-animate.min";
import "../../../bower_components/angular-sanitize/angular-sanitize.min";
import "../../../bower_components/angular-touch/angular-touch.min";
import "../../../bower_components/angular-bootstrap/ui-bootstrap.min";
import "../../../bower_components/angular-bootstrap/ui-bootstrap-tpls";

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