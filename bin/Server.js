import express from 'express';
import engine from 'ejs-mate';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import index from './routes/index';
import users from './routes/users';
import terraingenerator from './routes/terraingenerator';

export default class extends express {
  constructor () {
    super();

    this.engine('ejs', engine);

    this.use(favicon(path.join(__dirname, 'assets','images', 'favicon.ico')));
    this.set('views', path.join(__dirname, 'views'));
    this.set('view engine', 'ejs');
    this.use(express.static(path.join(__dirname, '../public')));
    this.use('/bower_components',  express.static( path.join(__dirname, '../../bower_components')));
    this.use(logger('dev'));
    this.use(bodyParser.json());
    this.use(bodyParser.urlencoded({ extended: false }));
    this.use(cookieParser());
    this.use(express.static(path.join(__dirname, '../public')));

    this.use('/', index);
    this.use('/users', users);
    this.use('/terraingenerator', terraingenerator);

    this.use(function (req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    if (this.get('env') === 'development') {
      this.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
          title: err.title,
          message: err.message,
          error: err
        });
      });
    }

    this.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        title: err.title,
        message: err.message,
        error: {}
      });
    });
  }
};