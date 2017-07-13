export default class AnalyticsModalCtrl
{
    /*@ngInject*/
    constructor ($scope, Analytics) {
        this.$scope = $scope;

        this.$scope.analytics = Analytics;

        this.$scope.isElevationCollapsed = true;
        this.$scope.isSlopeCollapsed = true;

        var that = this;

        this.$scope.toggleElevation = function () {
            that.$scope.isElevationCollapsed = !that.$scope.isElevationCollapsed;
        };

        this.$scope.toggleSlope = function () {
            that.$scope.isSlopeCollapsed = !that.$scope.isSlopeCollapsed;
        };

        this.$scope.close = function () {
            that.$scope.$parent.$close();
        };
    }
};