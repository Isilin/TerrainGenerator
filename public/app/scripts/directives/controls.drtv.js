'use strict';

angular.module('terrainGenerator')
    .directive('controls', [
        '$window', 
        'Renderer', 
        'Camera', 
        'Generator', 
        function ($window, Renderer, Camera, Generator) {
            return {
                link: function (scope, element, attr) {
                    var lastValue = Camera.freeze;

                    scope.onResize = function () {
                        Renderer.resize($window.innerWidth, $window.innerHeight);
                        Camera.that.aspect = Renderer.that.domElement.width / Renderer.that.domElement.height;
                        Camera.that.updateProjectionMatrix();

                        Camera.onResize($window.innerWidth, $window.innerHeight);
                    };

                    scope.onFocus = function () {
                        Camera.freeze = lastValue;
                    };

                    scope.onBlur = function () {
                        lastValue = Camera.freeze;
                        Camera.freeze = true;
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