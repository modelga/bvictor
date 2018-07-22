const Redis = require('redis-fast-driver');
const URL = require('url');
const debug = require('debug');
const R = require('ramda');

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

module.exports = (config, dataFn, fallback = dataFn) => {
  const connectionUrl = URL.parse(config.get('REDIS_URL'));
  const db = new Redis({
    host: connectionUrl.hostname,
    port: connectionUrl.port,
    auth: connectionUrl.auth && connectionUrl.auth.split(':')[1],
    maxRetries: 5
  });
  db.on('error', e => {
    if (e.message.indexOf('exhausted retries') !== -1) {
      throw e;
    }
    log('Redis Error', e);
  });

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
