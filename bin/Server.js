import express from 'express';
import path from 'path';
import ejs from 'ejs';
import fs from 'fs';
import servefavicon from 'serve-favicon';
import helmet from 'helmet';
import logger from 'morgan';
import bodyParser from 'body-parser';
import favicon from './assets/images/favicon.ico';

import index from './routes/index';

import template from './views/index.ejs';

export default class extends express {
  constructor() {
    super();

    this.use(logger('common'));
    this.use(helmet());

    this.use(servefavicon('dist/www/' + favicon));

    this.set('views', path.join(__dirname, '..', 'www', 'views'));
    this.set('view engine', 'ejs');
    this.engine('.ejs', ejs.renderFile);

    this.use(bodyParser.json());
    this.use(bodyParser.json({
      type: 'application/vnd.api+json'
    }));
    this.use(bodyParser.urlencoded({
      extended: false
    }));

    this.use(express.static(path.join(__dirname, '..', 'public')));
    this.use(express.static(path.join(__dirname, '..', '..', 'node_modules')));

    this.get('*', function (req, res) {
      fs.readFile(path.join(__dirname, '..', 'public', 'index.html'), function (err, html) {
        if (err) {
          throw err;
        } else {
          res.status(200).send(template({
            'title': 'Terrain Generator',
            'body': html
          }));
        }
      });
    });
  }
};