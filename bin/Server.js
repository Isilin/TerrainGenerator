import express from 'express';
import path from 'path';
import servefavicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import favicon from './assets/images/favicon.ico';

export default class extends express {
  constructor () {
    super();

    this.use(servefavicon('dist/www/' + favicon));
    this.use(express.static('dist/public/'));
    this.use(logger('dev'));
    this.use(bodyParser.json());
    this.use(bodyParser.urlencoded({ extended: false }));
    this.use(cookieParser());
    this.use(express.static('dist/public/'));
  }
};