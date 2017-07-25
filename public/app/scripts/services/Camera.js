import 'three';

const SPEED = 500;
const LOOKSPEED = 0.075;

export default class Camera extends THREE.PerspectiveCamera
{
    /*@ngInject*/
    constructor (Renderer, MathHelper) {
        super(60, Renderer.ratio, 1, 10000);

        this.$mathHelper = MathHelper;

        this.position.set(-600, 550, 440);
        this.target = new THREE.Vector3(0, 10, 100);

        this._freeze = true;

        this._moveForward = false;
        this._moveBack = false;
        this._moveLeft = false;
        this._moveRight = false;
        this._moveUp = false;
        this._moveDown = false;

        this.middleView = {x: 0, y: 0};
        this._mouse = {x: 0, y: 0};
        
        this._latitude = 0;
        this._longitude = 0;
        this._phi = this.$mathHelper.radians(90);
        this._theta = this.$mathHelper.radians(0);
    }

    get target () { return this._target; }
    set target (newTarget) {
        if (!(newTarget instanceof THREE.Vector3)) {
            console.log('The target of a camera is supposed to be a 3D point (THREE.Vector3).');
            return;
        }
        this._target = newTarget;
        this.lookAt(this._target);
    }

    get freeze () { return this._freeze; }
    set freeze(frozen) {
        if(typeof frozen !== 'boolean') {
            console.log("This parameter should be a boolean.");
            return;
        }
        this._freeze = frozen;
    }
    get moveForward () { return this._moveForward; }
    get moveBack () { return this._moveBack; }
    get moveLeft () { return this._moveLeft; }
    get moveRight () { return this._moveRight; }
    get moveUp () { return this._moveUp; }
    get moveDown () { return this._moveDown; }

    get middleView () { return this._middleView; }
    set middleView (newSize) {
        if(!newSize.hasOwnProperty('x')) {
            console.log("The new size should have a property x.");
            return;
        }
        if(!newSize.hasOwnProperty('y')) {
            console.log("The new size should have a property y.");
            return;
        }
        if(!this.$mathHelper.isNumber(newSize.x) || !this.$mathHelper.isNumber(newSize.y)) {
            console.log("The new size should be a 2D position.");
            return;
        }
        this._middleView = { x: newSize.x / 2, y: newSize.y / 2 };
    }
    get mouse () { return this._mouse; }

    get latitude () { return this._latitude; }
    get longitude () { return this._longitude; }
    get phi () { return this._phi; }
    get theta () { return this._theta; }

    set controlsEnabled (enable) {
        if(typeof enable !== 'boolean') {
            console.log("This parameter should be a boolean.");
            return;
        }
        this._freeze = !enable;
        this._moveForward = enable;
        this._moveBack = enable;
        this._moveLeft = enable;
        this._moveRight = enable;
        this._moveUp = enable;
        this._moveDown = enable;
    }

    get toString () {
        var s = '';
        s += 'camera.position.x = ' + Math.round(this.position.x) + ';\n';
        s += 'camera.position.y = ' + Math.round(this.position.y) + ';\n';
        s += 'camera.position.z = ' + Math.round(this.position.z) + ';\n';
        s += 'camera.rotation.x = ' + this.$mathHelper.degrees(this.rotation.x) + '°;\n';
        s += 'camera.rotation.y = ' + this.$mathHelper.degrees(this.rotation.y) + '°;\n';
        s += 'camera.rotation.z = ' + this.$mathHelper.degrees(this.rotation.z) + '°;\n';
        s += 'controls.latitude = ' + Math.round(this.latitude) + ';\n';
        s += 'controls.longitude = ' + Math.round(this.longitude) + ';\n';
        return s;
    }

    update (delta) {
        if(!this.$mathHelper.isNumber(delta)) {
            console.log("The delta should be a number.");
            return;
        }
        var moveX = 0, moveY = 0, moveZ = 0;
        var targetPosition = this.target;
        if ( !this.freeze || this.moveForward || this.moveBack || this.moveLeft 
                || this.moveRight || this.moveUp || this.moveDown) {
            var actualMoveSpeed = delta * SPEED;

            moveX = (this.moveRight - this.moveLeft)  *  actualMoveSpeed;
            moveY = (this.moveUp - this.moveDown)  *  actualMoveSpeed;
            moveZ = (this.moveBack - this.moveForward)  *  actualMoveSpeed;
            this.translateX(moveX);
            this.translateY(moveY);
            this.translateZ(moveZ);

            var actualLookSpeed = delta * LOOKSPEED;

            if(!this._freeze) {
                this._longitude += this.mouse.x * actualLookSpeed;
                this._latitude -= this.mouse.y * actualLookSpeed;
            }

            this._latitude = Math.max( - 85, Math.min( 85, this._latitude ) );
            this._phi = this.$mathHelper.radians( 90 - this._latitude );

            this._theta = this.$mathHelper.radians( this._longitude );

            targetPosition.x = this.position.x + 100 * Math.sin( this._phi ) * Math.cos( this._theta );
            targetPosition.y = this.position.y + 100 * Math.cos( this._phi );
            targetPosition.z = this.position.z + 100 * Math.sin( this._phi ) * Math.sin( this._theta );
        }
        this.lookAt( targetPosition );
        this.updateProjectionMatrix();
        return {x: moveX, y: moveY, z: moveZ};
    }

    onMouseUp (event) {
        if(!event.hasOwnProperty('button')) {
            console.log("The mouse up event should provides the button.");
            return;
        }
        switch (event.button) {
            case 0:
                this.freeze = true;
                break;
        }
    }

    onMouseDown (event) {
        if(!event.hasOwnProperty('button')) {
            console.log("The mouse up event should provides the button.");
            return;
        }
        switch (event.button) {
            case 0:
                this.freeze = false;
                break;
        }
    }

    onMouseMove (event) {
        if(!event.hasOwnProperty('xPos')) {
            console.log("The middle of the view should have a property xPos.");
            return;
        }
        if(!event.hasOwnProperty('yPos')) {
            console.log("The middle of the view should have a property yPos.");
            return;
        }
        if(!this.$mathHelper.isNumber(event.xPos) || !this.$mathHelper.isNumber(event.yPos)) {
            console.log("The position of the mouse should be a 2D position.");
            return;
        }
        this._mouse.x = event.xPos - this._middleView.x;
        this._mouse.y = event.yPos - this._middleView.y;
    }

    onMouseWheel (event) {
        if(!event.__proto__.hasOwnProperty('wheelDeltaY')) {
            console.log("The mouse wheel event should have a property deltaY.");
            return;
        }
        if(!this.$mathHelper.isNumber(event.wheelDeltaY)) {
            console.log("The delta Y of the mouse of wheel should be numeric.");
            return;
        }
        this.fov -= event.wheelDeltaY * 0.05;
        if(this.fov > 120) {
            this.fov = 120;
        } else if (this.fov < 15) {
            this.fov = 15;
        }
        this.updateProjectionMatrix();
    }

    onKeyUp (event) {
        if(!event.hasOwnProperty('keycode')) {
            console.log("The key up event should have a property keycode.");
            return;
        }
        if(!this.$mathHelper.isNumber(event.keycode)) {
            console.log("The keycode of the event should be numeric.");
            return;
        }
        switch (event.keycode) {
            case 90: /* 'Z' */
                this._moveForward = false;
                break;
            case 83: /* 'S' */
                this._moveBack = false;
                break;
            case 81: /* 'Q' */
                this._moveLeft = false;
                break;
            case 68: /* 'D' */
                this._moveRight = false;
                break;
            case 32: /* 'Space' */
                this._moveUp = false;
                break;
            case 16: /* 'Left Shift' */
                this._moveDown = false;
                break;
        }
    }
    
    onKeyDown (event) {
        if(!event.hasOwnProperty('keycode')) {
            console.log("The key down event should have a property keycode.");
            return;
        }
        if(!this.$mathHelper.isNumber(event.keycode)) {
            console.log("The keycode of the event should be numeric.");
            return;
        }
        switch (event.keycode) {
            case 90: /* 'Z' */
                this._moveForward = true;
                break;
            case 83: /* 'S' */
                this._moveBack = true;
                break;
            case 81: /* 'Q' */
                this._moveLeft = true;
                break;
            case 68: /* 'D' */
                this._moveRight = true;
                break;
            case 32: /* 'Space' */
                this._moveUp = true;
                break;
            case 16: /* 'Left Shift' */
                this._moveDown = true;
                break;
        }
    }
};