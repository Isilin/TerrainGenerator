import angular from 'angular';

export default class ControlsDrtv
{
    constructor () {
    }

    /*@ngInject*/
    controller ($scope, $window, Renderer, Camera) {
        $scope.renderer = Renderer;
        $scope.camera = Camera;
        $scope.lastValue = $scope.camera.freeze;
        $scope.window = $window;

        var that = this;

        $scope.onResize = function () {
            $scope.renderer.resize($scope.window.innerWidth, $scope.window.innerHeight);
            $scope.camera.aspect = $scope.renderer._ratio;
            $scope.camera.middleView = {x: $scope.window.innerWidth, y: $scope.window.innerHeight};
            $scope.camera.updateProjectionMatrix();
        };

        $scope.onFocus = function () {
            $scope.camera.freeze = $scope.lastValue;
        };

        $scope.onBlur = function () {
            $scope.lastValue = $scope.camera.freeze;
            $scope.camera.controlsEnabled = false;
        };
    }

    link (scope, element, attrs) {
        angular.element(scope.window).bind('resize', function () {
            scope.onResize();
        })
        .bind('focus', function () {
            scope.onFocus();
        })
        .bind('blur', function () {
            scope.onBlur();
        })

        element.bind('mouseup', function (event) {
            scope.camera.onMouseUp({event: "mouseup", button: event.button});
        })
        .bind('mousedown', function (event) {
            scope.camera.onMouseDown({event: "mousedown", button: event.button});
        })
        .bind('mousemove', function (event) {
            scope.camera.onMouseMove({xPos: event.clientX,
                                    yPos: event.clientY,
                                    xMove: event.movementX,
                                    yMove: event.movementY});
        })
        .bind('mousewheel', function (event) {
            scope.camera.onMouseWheel(event);
        })
        .bind('keyup', function (event) {
            scope.camera.onKeyUp({event: "keyup", keycode: event.which});
        })
        .bind('keydown', function (event) {
            scope.camera.onKeyDown({event: "keydown", keycode: event.which});
        });

        scope.onResize();
    }
};