const test = require('ava');
const supertest = require('supertest');
const app = require('./app');

const proxiedBetVictorConfig = {
  get(key) {
    if (key === 'UPSTREAM_BASE_URL')
      return 'https://betvictor-proxy.herokuapp.com';
    throw new Error('Invalid key');
  }
};

test('should return list of sports', async t => {
  const server = supertest(app(proxiedBetVictorConfig));
  const data = await server.get('/sports').expect(200);
  t.pass();
});
