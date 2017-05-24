'use strict';

angular.module('terrainGenerator')
    .controller('terrainCtrl', [
        '$scope', 
        '$uibModal',
        '$document',
        'stats',
        ($scope, $uibModal, $document, stats) => {
            $scope.stats = stats;

            $scope.open = function () {
                $uibModal.open({
                    animation: true,
                    component: 'analyticsCmpt',
                })
                .result.then(function (selectedItem) {
                        $scope.selected = selectedItem;
                    },
                    function () {
                        console.info('modal-component dismissed at: ' + new Date());
                    }
                );
            };

            console.log('terrain controller');
        }
    ]
);