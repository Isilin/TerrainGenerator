export default class GUICtrl {
    /*@ngInject*/
    constructor ($scope, $uibModal, Analytics, Generator) {
        this.$scope = $scope;
        this.$uibModal = $uibModal;
        this.generator = Generator;
        this.$scope.analytics = Analytics;

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
};