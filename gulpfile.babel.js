'use strict';

/* ========== GULP PLUGINS ========== */
import gulp from 'gulp';
var plugins = require('gulp-load-plugins')({
	pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
	replaceString: /\bgulp[\-.]/
    }
);

var path = {
    src_root: "public/",
    dest_root: "dist/",
    bowerfiles: "bower_components/",
    bower_dest: "public/vendor/",
};

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

gulp.task('build', function () {
    gulp.src('public/**/*.js')
        .pipe(plugins.babel({
            presets: ['env']
        }))
        //.pipe(uglify())
        .pipe(gulp.dest('dist/public'));

    gulp.src('public/assets/**/')
        .pipe(gulp.dest('dist/public/assets'));

    gulp.src(['public/app/**/*.html'])
        .pipe(plugins.minimize())
        .pipe(gulp.dest('dist/public/app/'));

    //gulp.src(['bower_components/**/'])
    //    .pipe(gulp.dest('dist/bower_components/'));
});

gulp.task('watch', function () {
  gulp.watch(['public/**/*'], ['build']);
});

gulp.task('dev', ['default_bower', 'build', 'watch']);

/* ========== SERVER TASKS ========== */

gulp.task('babel-server', function () {
    gulp.src('bin/www')
        .pipe(plugins.babel({
            presets: ['env']
        }))
        .pipe(gulp.dest('dist/bin/'));

    gulp.src('app.js')
        .pipe(plugins.babel({
            presets: ['env']
        }))
        .pipe(plugins.uglify())
        .pipe(gulp.dest('dist/'));

    gulp.src('routes/**/*.js')
        .pipe(plugins.babel({
            presets: ['env']
        }))
        .pipe(plugins.uglify())
        .pipe(gulp.dest('dist/routes/'));

    gulp.src('views/**/*.ejs')
        .pipe(gulp.dest('dist/views/'));
})

gulp.task('server', ['babel-server'], function () {
    plugins.nodemon({
        script: 'dist/bin/www',
        env: { 'NODE_ENV': 'development' },
        tasks: ['babel-server'],
        watch: ['node_modules', 'bin/www', 'routes/**/*.js', 'views/**/', 'app.js']
    });
});