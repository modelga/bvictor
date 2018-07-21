const express = require('express');
const Sports = require('./sports');

module.exports = config => {
  const app = express();
  app.use(Sports(config));
  return app;
};
