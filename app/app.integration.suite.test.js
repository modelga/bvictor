const test = require('ava');
const supertest = require('supertest');
const app = require('./app');

module.exports = baseConfig => {
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
    await server.get('/en-gb/sports').expect(200);
    t.pass();
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
    await server.get('/en-gb/sports').expect(200);
    t.pass();
  });

  test('should use no-cache', async t => {
    const config = {
      get(key) {
        if (key === 'CACHE_ENGINE') return 'none';
        return baseConfig.get(key);
      }
    };
    const server = supertest(app(config));
    await server.get('/en-gb/sports').expect(200);
    t.pass();
  });
};
