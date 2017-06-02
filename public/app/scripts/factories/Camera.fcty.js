'use strict';

angular.module('terrainGenerator')
    .factory('Camera', ['Renderer', function (Renderer) {
        const SPEED = 500;
        const LOOKSPEED = 0.075;

        var camera = {
            that: null,

            freeze: true,

            moveForward: false,
            moveBack: false,
            moveLeft: false,
            moveRight: false,
            moveUp: false,
            moveDown: false,

            middleX: 0,
            middleY: 0,
            mouseX: 0,
            mouseY: 0,

	        target: new THREE.Vector3( 0, 10, 100 ),
	        latitude: 0,
	        longitude: 0,
	        phi: THREE.Math.degToRad(90),
	        theta: THREE.Math.degToRad( 0 ),

            init: function () {
                this.that = new THREE.PerspectiveCamera(60, Renderer.that.domElement.width / Renderer.that.domElement.height, 1, 10000);
                this.that.position.set(0, 10, 0);
                this.that.lookAt(this.target);
            },

            update: function (delta) {
                var moveX = 0, moveY = 0, moveZ = 0;
                var targetPosition = this.target;
                if ( !this.freeze || this.moveForward || this.moveBack || this.moveLeft || this.moveRight
                                || this.moveUp || this.moveDown) {
                    var actualMoveSpeed = delta * SPEED;

                    moveX = (this.moveRight - this.moveLeft)  *  actualMoveSpeed;
                    moveY = (this.moveUp - this.moveDown)  *  actualMoveSpeed;
                    moveZ = (this.moveBack - this.moveForward)  *  actualMoveSpeed;
                    this.that.translateX(moveX);
                    this.that.translateY(moveY);
                    this.that.translateZ(moveZ);

                    var actualLookSpeed = delta * LOOKSPEED;

                    if(!this.freeze) {
                        this.longitude += this.mouseX * actualLookSpeed;
                        this.latitude -= this.mouseY * actualLookSpeed;
                    }

                    this.latitude = Math.max( - 85, Math.min( 85, this.latitude ) );
                    this.phi = THREE.Math.degToRad( 90 - this.latitude );

                    this.theta = THREE.Math.degToRad( this.longitude );

                    var position = this.that.position;

                    targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
                    targetPosition.y = position.y + 100 * Math.cos( this.phi );
                    targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );
                }

                this.that.lookAt( targetPosition );
                return {x: moveX, y: moveY, z: moveZ};
            },

            onResize: function (newWidth, newHeight) {
                this.middleX = newWidth / 2;
                this.middleY = newHeight / 2;
            },

            onMouseUp: function (event) {
                switch (event.button) {
                    case 0:
                        this.freeze = true;
                        break;
                }
            },

            onMouseDown: function (event) {
                switch (event.button) {
                    case 0:
                        this.freeze = false;
                        break;
                }
            },

            onMouseMove: function (event) {
                this.mouseX = event.xPos - this.middleX;
                this.mouseY = event.yPos - this.middleY;
            },

            onMouseWheel: function (event) {
                var fov = this.that.fov;
                fov -= event.wheelDeltaY * 0.05;
                if(fov > 120) {
                    fov = 120;
                } else if (fov < 15) {
                    fov = 15;
                }
                this.that.fov = fov;
                this.that.updateProjectionMatrix();
            },

            onKeyUp: function (event) {
                switch (event.key) {
                    case 90: // 'Z'
                        this.moveForward = false;
                        break;
                    case 83: // 'S'
                        this.moveBack = false;
                        break;
                    case 81: // 'Q'
                        this.moveLeft = false;
                        break;
                    case 68: // 'D'
                        this.moveRight = false;
                        break;
                    case 32: // 'Space'
                        this.moveUp = false;
                        break;
                    case 16: // 'Left Shift'
                        this.moveDown = false;
                        break;
                }
            },

            onKeyDown: function (event) {
                switch (event.key) {
                    case 90: // 'Z'
                        this.moveForward = true;
                        break;
                    case 83: // 'S'
                        this.moveBack = true;
                        break;
                    case 81: // 'Q'
                        this.moveLeft = true;
                        break;
                    case 68: // 'D'
                        this.moveRight = true;
                        break;
                    case 32: // 'Space'
                        this.moveUp = true;
                        break;
                    case 16: // 'Left Shift'
                        this.moveDown = true;
                        break;
                }
            }
        };

        camera.init();

        return camera;
    }]
)