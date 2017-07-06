'use strict';

import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import babel from 'gulp-babel';
import minimize from 'gulp-minimize';
import uglify from 'gulp-uglify';

/* ========== CLIENT TASKS ========== */

gulp.task('build', function () {
    gulp.src('public/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        //.pipe(uglify())
        .pipe(gulp.dest('dist/public'));

    gulp.src('public/assets/**/')
        .pipe(gulp.dest('dist/public/assets'));

    gulp.src(['public/app/**/*.html'])
        .pipe(minimize())
        .pipe(gulp.dest('dist/public/app/'));

    gulp.src(['bower_components/**/'])
        .pipe(gulp.dest('dist/bower_components/'));
});

gulp.task('watch', function () {
  gulp.watch(['public/**/*', 'bower_components'], ['build']);
});

gulp.task('dev', ['build', 'watch']);

/* ========== SERVER TASKS ========== */

gulp.task('babel-server', function () {
    gulp.src('bin/www')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist/bin/'));

    gulp.src('app.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/'));

    gulp.src('routes/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/routes/'));

    gulp.src('views/**/*.ejs')
        .pipe(gulp.dest('dist/views/'));
})

gulp.task('server', ['babel-server'], function () {
    nodemon({
        script: 'dist/bin/www',
        env: { 'NODE_ENV': 'development' },
        tasks: ['babel-server'],
        watch: ['node_modules', 'bin/www', 'routes/**/*.js', 'views/**/', 'app.js']
    });
});