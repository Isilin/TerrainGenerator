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
    assets: ['public/assets/**/*', !'public/assets/css']
};

gulp.task('build', function () {
    gulp.src('public/**/*.js')
        .pipe(plugins.babel())
        //.pipe(uglify())
        .pipe(gulp.dest('dist/public'));

    gulp.src('public/assets/**/')
        .pipe(gulp.dest('dist/public/assets'));

    gulp.src(['public/app/**/*.html'])
        .pipe(plugins.minimize())
        .pipe(gulp.dest('dist/public/app/'));
});

gulp.task('watch', function () {
  gulp.watch(['public/**/*'], ['build']);
});

gulp.task('dev', ['default_bower', 'build', 'watch']);

/* ========== SERVER TASKS ========== */

gulp.task('babel-server', function () {
    gulp.src(['bin/www', 'bin/app.js'])
        .pipe(plugins.babel())
        .pipe(gulp.dest('dist/bin/'));

    gulp.src(['bin/routes/**/*.js'])
        .pipe(plugins.babel())
        .pipe(gulp.dest('dist/bin/routes/**/'));

    gulp.src(['bin/views/**/*.ejs', 'bin/assets/**'])
        .pipe(gulp.dest('dist/bin/**/'));
})

gulp.task('server', ['babel-server'], function () {
    plugins.nodemon({
        script: 'dist/bin/www',
        env: { 'NODE_ENV': 'development' },
        tasks: ['babel-server'],
        watch: ['node_modules', 'bin/www', 'bin/routes/**/*.js', 'bin/views/**/', 'bin/app.js']
    });
});