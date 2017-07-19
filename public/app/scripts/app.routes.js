import THREE from 'three';

import AnalyticsModalCtrl from "./controllers/AnalyticsModalCtrl";
import ControlPanelCtrl from "./controllers/ControlPanelCtrl";
import GUICtrl from "./controllers/GUICtrl";

import ControlsDrtv from './directives/ControlsDrtv';
import PairEntryTableDrtv from './directives/PairEntryTableDrtv';

import Analytics from './factories/AnalyticsFcty';
import Generator from './factories/GeneratorFcty';
import Settings from './factories/SettingsFcty';
import TerrainFactory from './factories/TerrainFcty';

import Camera from './services/Camera';
import Materials from './services/Materials';
import MathHelper from './services/MathHelper';
import Renderer from './services/Renderer';
import Scene from './services/Scene';
import Webgl from './services/Webgl';

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

angular.module('terrainGenerator')
    .component('analyticsModalCmpt', {
            templateUrl: '/app/views/analyticsModal.html',
            controller: "AnalyticsModalCtrl"
        }
    )
    .component('controlPanelCmpt', {
        templateUrl: '/app/views/controlPanel.html',
        controller: "ControlPanelCtrl"
        }
    )
    .controller("AnalyticsModalCtrl", AnalyticsModalCtrl)
    .controller("ControlPanelCtrl", ControlPanelCtrl)
    .controller("GUICtrl", GUICtrl)
    .service('Webgl', Webgl)
    .factory('Settings', /*@ngInject*/(Webgl) => new Settings(Webgl))
    .service('MathHelper', MathHelper)
    .service('Renderer', Renderer)
    .service('Camera', Camera)
    .directive('controlsDrtv', () => new ControlsDrtv)
    .service('Materials', Materials)
    .service('Scene', Scene)
    .factory('Analytics', () => new Analytics())
    .directive('pairEntryTableDrtv', () => new PairEntryTableDrtv)
    .factory('Generator', /*@ngInject*/(Webgl, Scene, Renderer) => new Generator(Webgl, Scene, Renderer))
    .factory('TerrainFactory', /*@ngInject*/(Settings, Materials) => new TerrainFactory(Settings, Materials));