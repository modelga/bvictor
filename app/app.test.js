const { struct } = require('superstruct');
const test = require('ava');
const supertest = require('supertest');
const R = require('ramda');
const app = require('./app');

const proxiedBetVictorConfig = {
  get(key) {
    if (key === 'UPSTREAM_BASE_URL')
      return 'https://betvictor-proxy.herokuapp.com';
    throw new Error('Invalid key');
  }
};

test('should return non-empty list of sports and self-link', async t => {
  const server = supertest(app(proxiedBetVictorConfig));
  const { body } = await server.get('/sports').expect(200);
  t.true(Array.isArray(body.sports), 'Sports list has to be an array');
  t.true(body.sports.length > 0, 'Sports list has not to be empty');
  t.true(
    body.links.self === '/sports',
    'Body links has to be exact as requested'
  );
});

test('should return formatted list of sports', async t => {
  const server = supertest(app(proxiedBetVictorConfig));
  const { body } = await server.get('/sports').expect(200);

  const sport = struct({
    id: 'number',
    title: 'string',
    self: 'string',
    pos: 'number'
  });

  const matchingElements = R.filter(sport.test, body.sports);
  t.true(matchingElements.length === body.sports.length);
});
