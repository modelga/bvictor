const Redis = require('redis-fast-driver');
const URL = require('url');
const debug = require('debug');

const log = debug('bet-victor:sports-live:redis:db');

module.exports = config => {
  const url = URL.parse(config.get('REDIS_URL'));
  const db = new Redis({
    host: url.hostname,
    port: url.port,
    auth: url.auth && url.auth.split(':')[1],
    maxRetries: 5
  });
  db.on('connect', () => {
    log(`Connected to Redis: ${url.host}`);
  });
  db.on('error', e => {
    if (e.message.indexOf('exhausted retries') !== -1) {
      throw e;
    }
    log('Redis Error', e);
  });
  return db;
};
