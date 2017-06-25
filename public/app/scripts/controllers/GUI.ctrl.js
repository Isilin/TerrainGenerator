'use strict';

class GUICtrl
{
    constructor (scope, uibModal, analytics, generator) {
        this.$scope = scope;
        this.$uibModal = uibModal;
        this.generator = generator;
        this.$scope.analytics = analytics;

        var that = this;

        this.$scope.open = function () {
            that.$uibModal.open({
                animation: true,
                component: 'analyticsModal',
            })
            .result.then(function (selectedItem) {
                    that.$scope.selected = selectedItem;
                }
            );
        };

        this.generator.init();
        this.generator.start();
    }
}

GUICtrl.$inject = ['$scope', '$uibModal', 'analytics', 'Generator'];
angular.module('terrainGenerator').controller('GUICtrl', GUICtrl);