const debug = require('debug');
const R = require('ramda');
const DB = require('./redis-db');

const log = debug('bet-victor:sports-live:redis');

const RedisCache = (db, dataFn, ttl) => async key => {
  const data = await db.rawCallAsync(['GET', key || 'cached']);
  if (data) {
    return JSON.parse(data);
  }
  const newData = await dataFn(key);
  db.rawCallAsync([
    'SETEX',
    key || 'cached',
    ttl,
    JSON.stringify(newData)
  ]).catch(log);
  return newData;
};

module.exports = (config, dataFn, fallback) => {
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
