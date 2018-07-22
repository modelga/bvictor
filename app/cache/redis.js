const R = require('ramda');
const DB = require('./redis-db');
const RedisCache = require('./redis-cache');

const cache = (config, dataFn, fallback) => {
  const db = DB(config);
  const ttl = config.get('CACHE_TTL_SECONDS');
  const redisCache = RedisCache(db, dataFn, ttl);
  return key => {
    const provider = R.cond([
      [R.propEq('ready', true), R.always(redisCache)],
      [R.always(fallback), R.always(fallback)],
      [R.T, R.always(dataFn)]
    ])(db);
    return provider(key);
  };
};
module.exports = cache;
