import gulp from 'gulp';
import webpack from 'webpack';
import gwebpack from 'webpack-stream';
import webpackClientConfig from './config/webpack-client.config.babel';
import webpackServerConfig from './config/webpack-server.config.babel';
import gnodemon from 'gulp-nodemon';

gulp.task('server-build', function () {
    return gulp.src(['bin/**/*.js', 'bin/www.js'])
        .pipe(gwebpack(webpackServerConfig, webpack))
        .pipe(gulp.dest('dist/www/'));
});
    
gulp.task('client-build', function () {
    return gulp.src(['public/**/*.js'])
        .pipe(gwebpack(webpackClientConfig, webpack))
        .pipe(gulp.dest('dist/public/'));
});

gulp.task('build', ['server-build', 'client-build'], function () { return; });

gulp.task('client-watch', function () {
    return gulp.watch('public/**/*', ['client-build']);
});

gulp.task('watch', ['client-watch'], function () { return; });

gulp.task('server-start', ['watch', 'build'],function () {
    return gnodemon({
        script: 'dist/www/server.bundle.js',
        env: { 'NODE_ENV': 'development' },
        tasks: ['server-build'],
        watch: 'bin/**/*'
    })
    .on('restart', function () {
      console.log('Server has restarted!');
    });
})

gulp.task('default', ['server-start']);