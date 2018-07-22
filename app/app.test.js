const { struct } = require('superstruct');
const test = require('ava');
const supertest = require('supertest');
const R = require('ramda');
const fs = require('fs');
const path = require('path');
const app = require('./app');

const cache = async lang =>
  JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '..', `fixtures/${lang || 'en-gb'}.json`)
    )
  );

const baseConfig = {
  get(key) {
    if (key === 'UPSTREAM_BASE_URL')
      return process.env.UPSTREAM || 'https://betvictor-proxy.herokuapp.com';
    if (key === 'CACHE_ENGINE') return cache;
    if (key === 'DEFAULT_LANG') return 'en-gb';
    throw new Error(`Invalid test config key: ${key}`);
  }
};

test('should return non-empty list of sports and self-link', async t => {
  const server = supertest(app(baseConfig));
  const { body } = await server.get('/en-gb/sports').expect(200);
  t.true(Array.isArray(body.sports), 'Sports list has to be an array');
  t.true(body.sports.length > 0, 'Sports list has not to be empty');
  t.true(
    body.links.self === '/en-gb/sports',
    'Body links has to be exact as requested'
  );
});

test('should return formatted list of sports', async t => {
  const server = supertest(app(baseConfig));
  const { body } = await server.get('/en-gb/sports').expect(200);

  const Sport = struct({
    id: 'number',
    title: 'string',
    self: 'string',
    pos: 'number',
    events_count: 'number',
    total_outcomes: 'number'
  });
  body.sports.forEach(sport => t.true(Sport.test(sport)));
});

test('should return formatted list of events', async t => {
  const server = supertest(app(baseConfig));
  const sportsResponse = await server.get('/en-gb/sports').expect(200);
  const firstSport = R.path(['body', 'sports', 0], sportsResponse);
  const { body } = await server.get(firstSport.self).expect(200);
  const Event = struct({
    id: 'number',
    title: 'string',
    self: 'string',
    pos: 'number',
    score: 'string?',
    status: 'string',
    total_outcomes: 'number'
  });
  body.events.forEach(event => t.true(Event.test(event)));
});

test('should navigate on list of sports', async t => {
  const server = supertest(app(baseConfig));
  const sportsResponse = await server.get('/en-gb/sports').expect(200);
  const sportWithOutcomes = R.find(
    R.pipe(
      R.prop('total_outcomes'),
      R.lt(0)
    ),
    sportsResponse.body.sports
  );
  const eventsResponse = await server.get(sportWithOutcomes.self).expect(200);
  t.true(eventsResponse.body.events.length === sportWithOutcomes.events_count);
  const eventWithOutcomes = R.find(
    R.pipe(
      R.prop('total_outcomes'),
      R.lt(0)
    ),
    eventsResponse.body.events
  );
  const outcomeResponse = await server.get(eventWithOutcomes.self).expect(200);
  const { outcomes } = outcomeResponse.body;
  t.true(outcomes.length === eventWithOutcomes.total_outcomes);
});

test('should return formatted outcome', async t => {
  const server = supertest(app(baseConfig));
  const sportsResponse = await server.get('/en-gb/sports').expect(200);
  const sportWithOutcomes = R.find(
    R.pipe(
      R.prop('total_outcomes'),
      R.lt(0)
    ),
    sportsResponse.body.sports
  );
  const eventsResponse = await server.get(sportWithOutcomes.self).expect(200);
  const eventWithOutcomes = R.find(
    R.pipe(
      R.prop('total_outcomes'),
      R.lt(0)
    ),
    eventsResponse.body.events
  );
  const outcomeResponse = await server.get(eventWithOutcomes.self).expect(200);
  const { outcomes } = outcomeResponse.body;
  const Outcome = struct({
    id: 'number',
    description: 'string',
    price: 'string',
    price_decimal: 'number',
    price_id: 'number'
  });
  outcomes.forEach(outcome => t.true(Outcome.test(outcome)));
});

test('should redirect to default language', async t => {
  const server = supertest(app(baseConfig));
  const redirect = await server.get('/sports').expect(302);
  t.is(redirect.headers.location, '/en-gb/sports');
});

test('should handle not-found exception', async t => {
  const server = supertest(app(baseConfig));
  await server.get('/en-gb/sports/10').expect(404);
  t.pass();
});

test('should handle not-found for non-existing event in sport', async t => {
  const server = supertest(app(baseConfig));
  const { body } = await server.get('/en-gb/sports');
  await server.get(`${body.sports[0].self}/events/1`).expect(404);
  t.pass();
});

test('should handle not-found for non-existing event in non-existing sport', async t => {
  const server = supertest(app(baseConfig));
  await server.get('/en-gb/sports/1/events/1').expect(404);
  t.pass();
});

test('should render html for accept=text/html', async t => {
  const server = supertest(app(baseConfig));
  const { text } = await server
    .get('/en-gb/sports')
    .set('Accept', 'text/html')
    .expect('Content-Type', /html/)
    .expect(200);
  t.true(text.indexOf('<html>') !== -1, 'should contain html tag');
  t.true(text.indexOf('Refresh</a>') !== -1, 'should contain refresh link');
});

test('should render html for accept=unknown', async t => {
  const server = supertest(app(baseConfig));
  const { text } = await server
    .get('/en-gb/sports')
    .set('Accept', 'unknown')
    .expect('Content-Type', /html/)
    .expect(200);
  t.true(text.indexOf('<html>') !== -1, 'should contain html tag');
  t.true(text.indexOf('Refresh</a>') !== -1, 'should contain refresh link');
});

test('should use in-memory cache', async t => {
  const config = {
    get(key) {
      if (key === 'CACHE_ENGINE') return 'in-memory';
      if (key === 'CACHE_TTL_SECONDS') return 1;
      return baseConfig.get(key);
    }
  };
  const server = supertest(app(config));
  await server.get('/en-gb/sports').expect(200);
  t.pass();
});

test('should respond with 400 bad request for invalid language', async t => {
  const server = supertest(app(baseConfig));
  await server.get('/un-kn/sports').expect(400);
  t.pass();
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
