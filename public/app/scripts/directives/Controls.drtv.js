'use strict';

angular.module('terrainGenerator')
    .directive('controls', [
        '$window', 
        'Renderer', 
        'Camera', 
        function ($window, Renderer, Camera) {
            return {
                link: function (scope, element) {
                    var lastValue = Camera._freeze;

                    scope.onResize = function () {
                        Renderer.resize($window.innerWidth, $window.innerHeight);
                        Camera._parent.aspect = Renderer._ratio;
                        Camera._parent.updateProjectionMatrix();

                        Camera.onResize($window.innerWidth, $window.innerHeight);
                    };

                    scope.onFocus = function () {
                        Camera._freeze = lastValue;
                    };

                    scope.onBlur = function () {
                        lastValue = Camera._freeze;
                        Camera.turnOffControls();
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
                        Camera.onKeyUp({event: "keyup", key: event.originalEvent.which});
                    })
                    .bind('keydown', function (event) {
                        Camera.onKeyDown({event: "keydown", key: event.originalEvent.which});
                    });

                    scope.onResize();
                }
            };
    }]
)