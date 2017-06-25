'use strict';

angular.module('terrainGenerator')
    .directive('controls', [
        '$window', 
        'Renderer', 
        'Camera', 
        function ($window, Renderer, Camera) {
            return {
                link: function (scope, element) {
                    var lastValue = Camera.freeze;

                    scope.onResize = function () {
                        Renderer.resize($window.innerWidth, $window.innerHeight);
                        Camera.aspect = Renderer._ratio;
                        Camera.middleView = {x: $window.innerWidth, y: $window.innerHeight};
                        Camera.updateProjectionMatrix();
                    };

                    scope.onFocus = function () {
                        Camera.freeze = lastValue;
                    };

                    scope.onBlur = function () {
                        lastValue = Camera.freeze;
                        Camera.controlsEnabled = false;
                    };

                    angular.element($window).bind('resize', function () {
                        scope.onResize();
                    })
                    .bind('focus', function () {
                        scope.onFocus();
                    })
                    .bind('blur', function () {
                        scope.onBlur();
                    })

                    element.bind('mouseup', function (event) {
                        Camera.onMouseUp({event: "mouseup", button: event.originalEvent.button});
                    })
                    .bind('mousedown', function (event) {
                        Camera.onMouseDown({event: "mousedown", button: event.originalEvent.button});
                    })
                    .bind('mousemove', function (event) {
                        Camera.onMouseMove({xPos: event.originalEvent.clientX,
                                            yPos: event.originalEvent.clientY,
                                            xMove: event.originalEvent.movementX,
                                            yMove: event.originalEvent.movementY});
                    })
                    .bind('mousewheel', function (event) {
                        Camera.onMouseWheel(event.originalEvent);
                    })
                    .bind('keyup', function (event) {
                        Camera.onKeyUp({event: "keyup", keycode: event.originalEvent.which});
                    })
                    .bind('keydown', function (event) {
                        Camera.onKeyDown({event: "keydown", keycode: event.originalEvent.which});
                    });

                    scope.onResize();
                }
            };
    }]
)