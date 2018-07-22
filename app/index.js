const debug = require('debug');
const config = require('../config');
const app = require('./app');

const port = config.get('PORT');
const log = debug('bet-victor:express');

app(config).listen(port, () => {
  log(`Listening now on port ${port}`);
});
