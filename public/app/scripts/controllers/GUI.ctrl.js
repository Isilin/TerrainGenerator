'use strict';

angular.module('terrainGenerator')
    .controller('GUICtrl', [
        '$scope', 
        '$uibModal',
        'analytics',
        'Generator',
        function ($scope, $uibModal, analytics, Generator) {
            $scope.analytics = analytics;

            $scope.open = function () {
                $uibModal.open({
                    animation: true,
                    component: 'analyticsModal',
                })
                .result.then(function (selectedItem) {
                        $scope.selected = selectedItem;
                    }
                );
            };

            var generator = Generator;

            generator.init();
            generator.start();
        }
    ]
);