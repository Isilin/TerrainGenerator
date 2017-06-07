'use strict';

angular.module('terrainGenerator')
    .controller('guiCtrl', [
        '$scope', 
        '$uibModal',
        'analytics',
        'Generator',
        function ($scope, $uibModal, analytics, Generator) {
            $scope.analytics = analytics;

            $scope.open = function () {
                $uibModal.open({
                    animation: true,
                    component: 'analyticsModalCmpt',
                })
                .result.then(function (selectedItem) {
                        $scope.selected = selectedItem;
                    }
                );
            };

            Generator.init();
            Generator.start();
        }
    ]
);