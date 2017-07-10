'use strict';

/* ========== GULP PLUGINS ========== */
import gulp from 'gulp';
var plugins = require('gulp-load-plugins')({
	pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
	replaceString: /\bgulp[\-.]/
    }
);

var vendor = {
    js: ['bower_components/**/*.js'],
    css: ['bower_components/**/*.css'],
    bower: ["bower.json"],
    dist: "dist/public/vendor/"
}

/* ========== LIBRARIES ========== */
gulp.task('bower_js', function () {
    gulp.src(plugins.mainBowerFiles("**/*.js"), { base: 'bower_components' })
        .pipe(plugins.concat("vendor.js"))
        .pipe(plugins.uglify())
        .pipe(plugins.rename("dist.min.js"))
        .pipe(gulp.dest(vendor.dist));
});

gulp.task('bower_css', function () {
    gulp.src(plugins.mainBowerFiles("**/*.css"), { base: 'bower_components' })
        .pipe(plugins.concat("vendor.css"))
        //.pipe(uglify())
        .pipe(plugins.rename("dist.min.css"))
        .pipe(gulp.dest(vendor.dist));
});

gulp.task('bower', ['bower_js', 'bower_css']);

gulp.task('watch_bower', ['bower'], function () {
    gulp.watch(vendor.js, ['bower_js']);
    gulp.watch(vendor.css, ['bower_css']);
    gulp.watch(vendor.bower, ['bower']);
});

gulp.task('default_bower', ['watch_bower']);

/* ========== CLIENT TASKS ========== */

var client = {
    js: ['public/app/scripts/**/*.js'],
    css: ['public/assets/css/*.css'],
    assets: ['public/assets/**/*', !'public/assets/css'],
    dist: "dist/public/"
};

gulp.task('build_js', function () {
    gulp.src(client.js)
        .pipe(plugins.babel())
        .pipe(plugins.concat("client.js"))
        .pipe(plugins.uglify())
        .pipe(plugins.rename("client.min.js"))
        .pipe(gulp.dest(client.dist));
});

gulp.task('build', function () {
    gulp.src('public/assets/**/')
        .pipe(gulp.dest('dist/public/assets'));

    gulp.src(['public/app/**/*.html'])
        .pipe(plugins.minimize())
        .pipe(gulp.dest('dist/public/app/'));
});

gulp.task('watch_client', ['build'], function () {
    gulp.watch(client.js, ['build_js']);
});

gulp.task('default_client', ['watch_client']);

gulp.task('dev', ['default_bower', 'default_client']);

/* ========== SERVER TASKS ========== */

var server = {
    js: ["bin/www", "bin/**/*.js"],
    dist: "dist/bin/",
    node: ["node_modules/", "gulpfile.babel.js", "package.json"]
}

gulp.task("server_js", function () {
    gulp.src(server.js)
        .pipe(plugins.babel())
        .pipe(plugins.uglify())
        .pipe(gulp.dest(server.dist));
});

gulp.task('babel-server', ["server_js"], function () {
    gulp.src(['bin/views/**/*.ejs'])
        .pipe(gulp.dest('dist/bin/views'));
    gulp.src(['bin/assets/**/*'])
        .pipe(gulp.dest("dist/bin/assets"));
});

gulp.task('server', ['babel-server'], function () {
    plugins.nodemon({
        script: 'dist/bin/www',
        env: { 'NODE_ENV': 'development' },
        tasks: ['babel-server'],
        watch: [server.node, 'bin/views/**/', server.js]
    });
});