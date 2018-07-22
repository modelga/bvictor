const test = require('ava');

const RedisCache = require('./redis-cache');

const DB = () => {
  const db = {
    calls: [],
    data: {},
    async rawCallAsync([op, key, ttl, data]) {
      db.calls.push(op);
      if (op === 'SETEX') {
        db.ttl = ttl;
        db.data[key] = data;
      }
      if (op === 'GET') return db.data[key] || undefined;
      return undefined;
    }
  };
  return db;
};

test('should be able to feed cache', async t => {
  const db = DB();
  const cache = RedisCache(db, async key => ({ id: key }), 10);
  const data = await cache('en-gb');
  t.deepEqual(data, { id: 'en-gb' });
  t.deepEqual(db.calls, ['GET', 'SETEX']);
  t.is(db.ttl, 10);
  t.pass();
});

test('should be able to get cached', async t => {
  const db = DB();
  const cache = RedisCache(db, async key => ({ id: key }), 10);
  await cache('en-gb'); // feed
  const data = await cache('en-gb');
  t.deepEqual(data, { id: 'en-gb' });
  t.deepEqual(db.calls, ['GET', 'SETEX', 'GET']);
  t.pass();
});
