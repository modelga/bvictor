const test = require('ava');
const supertest = require('supertest');
const app = require('./app');
const DB = require('../app/cache/redis-db');

module.exports = baseConfig => {
  test('should integrate with upstream', async t => {
    const server = supertest(app(baseConfig));
    const { body } = await server.get('/en-gb/sports').expect(200);
    t.true(body.sports.length > 0);
  });

  test('should use redis cache fallback', async t => {
    const config = {
      get(key) {
        if (key === 'CACHE_ENGINE') return 'redis';
        if (key === 'CACHE_TTL_SECONDS') return 1;
        if (key === 'REDIS_URL') return 'redis://redis';
        return baseConfig.get(key);
      }
    };
    const server = supertest(app(config));
    const { body } = await server.get('/en-gb/sports').expect(200);
    t.true(body.sports.length > 0);
  });

  test('should use redis if defined', async t => {
    const config = {
      get(key) {
        if (key === 'CACHE_ENGINE') return 'redis';
        if (key === 'CACHE_TTL_SECONDS') return 1;
        if (key === 'REDIS_URL') return process.env.REDIS_URL;
        return baseConfig.get(key);
      }
    };
    const server = supertest(app(config));
    const { body } = await server.get('/en-gb/sports').expect(200);
    const db = DB(config);
    const data = JSON.parse(await db.rawCallAsync(['GET', 'en-gb']));
    t.truthy(data);
    t.true(data.sports.length === body.sports.length);
  });

  test('should use no-cache', async t => {
    const config = {
      get(key) {
        if (key === 'CACHE_ENGINE') return 'none';
        return baseConfig.get(key);
      }
    };
    const server = supertest(app(config));
    const { body } = await server.get('/en-gb/sports').expect(200);
    t.true(body.sports.length > 0);
  });

  test('should fail for invalid upstream', async t => {
    const config = {
      get(key) {
        if (key === 'UPSTREAM_BASE_URL')
          return 'https://httpstat.us/teapot/index?aspxerrorpath=';
        if (key === 'CACHE_ENGINE') return 'none';
        return baseConfig.get(key);
      }
    };
    const server = supertest(app(config));
    const { text } = await server.get('/en-gb/sports').expect(500);
    t.is(text, 'Cannot fetch data from upstream');
  });

  test('should pass upstream fail cause with code=500', async t => {
    const config = {
      get(key) {
        if (key === 'UPSTREAM_BASE_URL') return 'https://httpstat.us/404';
        if (key === 'CACHE_ENGINE') return 'none';
        return baseConfig.get(key);
      }
    };
    const server = supertest(app(config));
    const { text } = await server.get('/en-gb/sports').expect(500);
    t.is(text, 'Request failed with status code 404');
  });
};
