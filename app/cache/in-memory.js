const memoizee = require('memoizee');

module.exports = (config, dataFn) =>
  memoizee(dataFn, {
    promise: true,
    primitive: true,
    maxAge: config.get('CACHE_TTL_SECONDS') * 1000
  });
