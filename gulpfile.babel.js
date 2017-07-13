'use strict';

/* ========== GULP PLUGINS ========== */
import gulp from 'gulp';
var plugins = require('gulp-load-plugins')({
	pattern: ['gulp-*', 'gulp.*', 'main-bower-files', 'webpack', 'webpack-stream'],
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
    js: ['public/app/scripts/**/*.js', 'public/app/scripts/**/*.js'],
    html: ['public/app/**/*.html'],
    assets: ['public/assets/**/*'],
    dist: "dist/public/"
};

gulp.task('build_js', function () {
    gulp.src(client.js)
        .pipe(plugins.webpackStream(require('./webpack.config.js'), plugins.webpack))
        .pipe(plugins.rename("bundle.min.js"))
        .pipe(gulp.dest(client.dist + "app/scripts/"));
});

gulp.task('build_html', function () {
    gulp.src(client.html)
        .pipe(plugins.minimize())
        .pipe(gulp.dest(client.dist + "app/"));
});

gulp.task('build_assets', function () {
    gulp.src(client.assets)
        .pipe(gulp.dest(client.dist + "assets/"));
});

gulp.task('build', ["build_js", 'build_html', 'build_assets']);

gulp.task('watch_client', ['build'], function () {
    gulp.watch(client.js, ['build_js']);
    gulp.watch(client.html, ['build_html']);
    gulp.watch(client.assets, ['build_assets']);
});

gulp.task('default_client', ['watch_client']);

gulp.task('dev', ['default_bower', 'default_client']);

/* ========== SERVER TASKS ========== */

var server = {
    js: ["bin/www", "bin/Server.js"],
    js_routes: ["bin/routes/*.js"],
    assets: ['bin/assets/**/*'],
    dist: "dist/bin/",
    node: ["node_modules/", "gulpfile.babel.js", "package.json"],
    script: "dist/bin/www"
}

gulp.task("server_js", function () {
    gulp.src(server.js)
        .pipe(plugins.babel())
        .pipe(plugins.uglify())
        .pipe(gulp.dest(server.dist));

    gulp.src(server.js_routes)
        .pipe(plugins.babel())
        .pipe(plugins.uglify())
        .pipe(gulp.dest(server.dist + "routes/"));
});

gulp.task('babel-server', ["server_js"], function () {
    gulp.src(['bin/views/**/*.ejs'])
        .pipe(gulp.dest(server.dist + 'views'));
    gulp.src(server.assets)
        .pipe(gulp.dest(server.dist + "assets"));
});

gulp.task('server', ['babel-server'], function () {
    plugins.nodemon({
        script: server.script,
        env: { 'NODE_ENV': 'development', 'PORT': 5000 },
        tasks: ['babel-server'],
        watch: ["node_modules/", "gulpfile.babel.js", "package.json", 'bin/views/**/', "bin/www", "bin/**/*.js"]
    });
});