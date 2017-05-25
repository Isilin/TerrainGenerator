'use strict';

angular.module('terrainGenerator')
    .controller('guiCtrl', [
        '$scope', 
        '$uibModal',
        'analytics',
        ($scope, $uibModal, analytics) => {
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
        }
    ]
);