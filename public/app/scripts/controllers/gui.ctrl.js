'use strict';

angular.module('terrainGenerator')
    .controller('guiCtrl', [
        '$scope', 
        '$uibModal',
        'stats',
        ($scope, $uibModal, stats) => {
            $scope.stats = stats;

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