export default class ControlPanelCtrl
{
    /*@ngInject*/
    constructor ($scope, Settings, Scene) {
        this.$scope = $scope;
        this.scene = Scene;

        this.$scope.settings = Settings;
        
        var that = this;

        this.$scope.getText = function () {
            return that.$scope.status.menu ? "Close Controls" : "Open Controls";
        };

        this.$scope.toggle = function () {
            that.$scope.status.menu = !that.$scope.status.menu;
        };

        this.$scope.status = {
            'menu': true,
            'heightmap': {},
            'decoration': {},
            'size': {},
            'edges': {}
        };

        this.$scope.refresh = function () {
            that.scene.refreshTerrain();
        };

        this.$scope.updateSmoothing = function () {
            that.scene.updateSmoothing(that.$scope.settings.smoothing.selected, that.$scope.settings.lastSetup);
            that.scene.updateScattering();
            if (that.$scope.settings.lastSetup != null && that.$scope.settings.lastSetup.heightmap) {
                THREE.Terrain.toHeightmap(that.scene.terrain.children[0].geometry.vertices, that.$scope.settings.lastSetup);
            }
        };

        this.$scope.updateScattering = function () {
            that.scene.updateScattering();
            if (that.$scope.settings.lastSetup != null && that.$scope.settings.lastSetup.heightmap) {
                THREE.Terrain.toHeightmap(that.scene.terrain.children[0].geometry.vertices, that.$scope.settings.lastSetup);
            }
        };

        this.$scope.updateLightColor = function () {
            that.scene._skydome.material.color.set(that.$scope.settings.lightColor);
        };
    }
};