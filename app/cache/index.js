// const Redis = require('./redis');
const debug = require('debug');
const InMemory = require('./in-memory');
const Redis = require('./redis');

const log = debug('bet-victor:sports-live:cache');

module.exports = (config, dataFn) => {
  const engine = config.get('CACHE_ENGINE');
  if (typeof engine === 'function') {
    return engine;
  }
  switch (engine) {
    case 'in-memory':
      log('Using in-memory cache');
      return InMemory(config, dataFn);
    case 'redis':
      log('Using redis cache');
      return Redis(config, dataFn, InMemory(config, dataFn));
    case 'none':
    default:
      return dataFn;
  }
};
