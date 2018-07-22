const debug = require('debug');

const log = debug('bet-victor:sports-live:redis');

module.exports = (db, dataFn, ttl) => async key => {
  const data = await db.rawCallAsync(['GET', key]);
  if (data) {
    return JSON.parse(data);
  }
  const newData = await dataFn(key);
  db.rawCallAsync(['SETEX', key, ttl, JSON.stringify(newData)]).catch(log);
  return newData;
};
