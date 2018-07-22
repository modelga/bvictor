const express = require('express');
const hbs = require('hbs');

const Sports = require('./sports');

module.exports = config => {
  const app = express();
  app.set('view engine', 'hbs');
  app.engine('hbs', hbs.__express); // eslint-disable-line no-underscore-dangle
  app.use(Sports(config));
  return app;
};
