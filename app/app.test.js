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
    pos: 'number',
    events_count: 'number',
    total_outcomes: 'number'
  });

  const matchingElements = R.filter(sport.test, body.sports);
  t.true(matchingElements.length === body.sports.length);
});

test('should eturn formatted list of events', async t => {
  const server = supertest(app(proxiedBetVictorConfig));
  const sportsResponse = await server.get('/sports').expect(200);
  const firstSport = R.path(['body', 'sports', 0], sportsResponse);
  const { body } = await server.get(firstSport.self).expect(200);
  const event = struct({
    id: 'number',
    title: 'string',
    self: 'string',
    pos: 'number',
    score: 'string?',
    status: 'string',
    total_outcomes: 'number'
  });
  const matchingElements = R.filter(event.test, body.events);
  t.true(matchingElements.length === body.events.length);
});

test('should navigate on list of sports', async t => {
  const server = supertest(app(proxiedBetVictorConfig));
  const sportsResponse = await server.get('/sports').expect(200);
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
});
