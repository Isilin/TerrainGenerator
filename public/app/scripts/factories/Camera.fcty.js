'use strict';

angular.module('terrainGenerator')
    .factory('Camera', [
        'Renderer', 
        function (Renderer) {
            const SPEED = 500;
            const LOOKSPEED = 0.075;

            var camera = {
                _parent: null,

                _freeze: true,

                _moveForward: false,
                _moveBack: false,
                _moveLeft: false,
                _moveRight: false,
                _moveUp: false,
                _moveDown: false,

                _middleX: 0,
                _middleY: 0,
                _mouseX: 0,
                _mouseY: 0,

                _target: new THREE.Vector3( 0, 10, 100 ),
                _latitude: 0,
                _longitude: 0,
                _phi: THREE.Math.degToRad(90),
                _theta: THREE.Math.degToRad( 0 ),

                init: function () {
                    this._parent = new THREE.PerspectiveCamera(60, Renderer.ratio, 1, 10000);
                    this._parent.position.set(-600, 550, 440);
                    this._parent.lookAt(this._target);
                },

                turnOffControls: function () {
                    this._freeze = true;
                    this._moveForward = false;
                    this._moveBack = false;
                    this._moveLeft = false;
                    this._moveRight = false;
                    this._moveUp = false;
                    this._moveDown = false;
                },

                update: function (delta) {
                    var moveX = 0, moveY = 0, moveZ = 0;
                    var targetPosition = this._target;
                    if ( !this._freeze || this._moveForward || this._moveBack || this._moveLeft 
                            || this._moveRight || this._moveUp || this._moveDown) {
                        var actualMoveSpeed = delta * SPEED;

                        moveX = (this._moveRight - this._moveLeft)  *  actualMoveSpeed;
                        moveY = (this._moveUp - this._moveDown)  *  actualMoveSpeed;
                        moveZ = (this._moveBack - this._moveForward)  *  actualMoveSpeed;
                        this._parent.translateX(moveX);
                        this._parent.translateY(moveY);
                        this._parent.translateZ(moveZ);

                        var actualLookSpeed = delta * LOOKSPEED;

                        if(!this._freeze) {
                            this._longitude += this._mouseX * actualLookSpeed;
                            this._latitude -= this._mouseY * actualLookSpeed;
                        }

                        this._latitude = Math.max( - 85, Math.min( 85, this._latitude ) );
                        this._phi = THREE.Math.degToRad( 90 - this._latitude );

                        this._theta = THREE.Math.degToRad( this._longitude );

                        var position = this._parent.position;

                        targetPosition.x = position.x + 100 * Math.sin( this._phi ) * Math.cos( this._theta );
                        targetPosition.y = position.y + 100 * Math.cos( this._phi );
                        targetPosition.z = position.z + 100 * Math.sin( this._phi ) * Math.sin( this._theta );
                    }

                    this._parent.lookAt( targetPosition );
                    return {x: moveX, y: moveY, z: moveZ};
                },

                onResize: function (newWidth, newHeight) {
                    this._middleX = newWidth / 2;
                    this._middleY = newHeight / 2;
                },

                onMouseUp: function (event) {
                    switch (event.button) {
                        case 0:
                            this._freeze = true;
                            break;
                    }
                },

                onMouseDown: function (event) {
                    switch (event.button) {
                        case 0:
                            this._freeze = false;
                            break;
                    }
                },

                onMouseMove: function (event) {
                    this._mouseX = event.xPos - this._middleX;
                    this._mouseY = event.yPos - this._middleY;
                },

                onMouseWheel: function (event) {
                    var fov = this._parent.fov;
                    fov -= event.wheelDeltaY * 0.05;
                    if(fov > 120) {
                        fov = 120;
                    } else if (fov < 15) {
                        fov = 15;
                    }
                    this._parent.fov = fov;
                    this._parent.updateProjectionMatrix();
                },

                onKeyUp: function (event) {
                    switch (event.key) {
                        case 90: // 'Z'
                            this._moveForward = false;
                            break;
                        case 83: // 'S'
                            this._moveBack = false;
                            break;
                        case 81: // 'Q'
                            this._moveLeft = false;
                            break;
                        case 68: // 'D'
                            this._moveRight = false;
                            break;
                        case 32: // 'Space'
                            this._moveUp = false;
                            break;
                        case 16: // 'Left Shift'
                            this._moveDown = false;
                            break;
                    }
                },

                onKeyDown: function (event) {
                    switch (event.key) {
                        case 90: // 'Z'
                            this._moveForward = true;
                            break;
                        case 83: // 'S'
                            this._moveBack = true;
                            break;
                        case 81: // 'Q'
                            this._moveLeft = true;
                            break;
                        case 68: // 'D'
                            this._moveRight = true;
                            break;
                        case 32: // 'Space'
                            this._moveUp = true;
                            break;
                        case 16: // 'Left Shift'
                            this._moveDown = true;
                            break;
                    }
                },

                toString: function () {
                    var s = '';
                    s += 'camera.position.x = ' + Math.round(camera._parent.position.x) + ';\n';
                    s += 'camera.position.y = ' + Math.round(camera._parent.position.y) + ';\n';
                    s += 'camera.position.z = ' + Math.round(camera._parent.position.z) + ';\n';
                    s += 'camera.rotation.x = ' + Math.round(camera._parent.rotation.x * 180 / Math.PI) + ' * Math.PI / 180;\n';
                    s += 'camera.rotation.y = ' + Math.round(camera._parent.rotation.y * 180 / Math.PI) + ' * Math.PI / 180;\n';
                    s += 'camera.rotation.z = ' + Math.round(camera._parent.rotation.z * 180 / Math.PI) + ' * Math.PI / 180;\n';
                    s += 'controls.latitude = ' + Math.round(camera._latitude) + ';\n';
                    s += 'controls.longitude = ' + Math.round(camera._longitude) + ';\n';
                    console.log(s);
                }
            };

            camera.init();

            return camera;
        }
    ]
)