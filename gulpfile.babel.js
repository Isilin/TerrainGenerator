'use strict';

import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import babel from 'gulp-babel';
import minimize from 'gulp-minimize';
import uglify from 'gulp-uglify';
import browserify from 'gulp-browserify';

/* ========== CLIENT TASKS ========== */

gulp.task('build-client', function () {
    gulp.src('public/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(browserify())
        //.pipe(uglify())
        .pipe(gulp.dest('dist/public'));

    gulp.src('public/assets/**/')
        .pipe(gulp.dest('dist/public/assets'));

    gulp.src(['public/app/**/*.html'])
        .pipe(minimize())
        .pipe(gulp.dest('dist/public/app/'));
});

gulp.task('watch-client', function () {
  gulp.watch(['public', 'bower_components'], ['build-client']);
});

gulp.task('dev', ['build-client', 'watch-client']);

/* ========== SERVER TASKS ========== */

gulp.task('babel-server', function () {
    gulp.src(['bin/www', 'bin/**/*.js'])
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/bin'));

    gulp.src(['bin/**/*.ejs', 'bin/**/*.ico'])
        .pipe(gulp.dest('dist/bin'));
})

gulp.task('server', ['babel-server'], function () {
    nodemon({
        script: 'dist/bin/www',
        env: { 'NODE_ENV': 'development' },
        tasks: ['babel-server'],
        watch: ['node_modules', 'bin']
    });
});