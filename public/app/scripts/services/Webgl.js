export default class Webgl
{
    /*@ngInject*/
    constructor ($window) {
        this.existingContext = this.isExistingContext();
        this._window = $window;
    }

    isExistingContext () { 
        try { 
            var canvas = document.createElement( 'canvas' ); 
            return !!window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); 
        } 
        catch( e ) { 
            return false; 
        } 
    }

    alertNoGL () {
        if (!this.existingContext) {
            alert('Your browser does not appear to support WebGL. You can try viewing this page anyway, but it may be slow and some things may not look as intended. Please try viewing on desktop Firefox or Chrome.');
        }
    }

    checkDisablingGL () {
        if (/&?webgl=0\b/g.test(location.hash)) {
            this.existingContext = !confirm('Are you sure you want to disable WebGL on this page?');
            if (this.existingContext) {
                location.hash = '#';
            }
        }
    }

    initGL () {
        this.alertNoGL();
        this.checkDisablingGL();

        /* Workaround: in Chrome, if a page is opened with window.open(),
            window.innerWidth and window.innerHeight will be zero.*/
        if (this._window.innerWidth === 0) {
            this._window.innerWidth = this.window.parent.innerWidth;
            this._window.innerHeight = this.window.parent.innerHeight;
        }
    }
};