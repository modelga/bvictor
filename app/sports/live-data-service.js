const R = require('ramda');
const links = require('./links');

const sortByPos = R.sortBy(R.prop('pos'));

const formatSport = R.pipe(
  sport => R.assoc('events_count', (sport.events || []).length, sport),
  sport =>
    R.assoc(
      'total_outcomes',
      R.pipe(
        R.prop('events'),
        R.pluck('total_outcomes'),
        R.sum
      )(sport),
      sport
    ),
  R.pick(['title', 'id', 'pos', 'events_count', 'total_outcomes']),
  sport => R.assoc('self', links.resources.sportEvents(sport), sport)
);

const formatEvent = sport =>
  R.pipe(
    R.pick(['status', 'title', 'id', 'pos', 'total_outcomes', 'score']),
    event => R.assoc('self', links.resources.sportOutcomes(sport, event), event)
  );
const formatOutcome = R.pick([
  'id',
  'description',
  'price',
  'price_decimal',
  'price_id'
]);
module.exports = provider => ({
  async getSports() {
    const data = await provider.getData();
    return { sports: sortByPos(R.map(formatSport, data.sports)) };
  },
  async getEvents(sportId) {
    const data = await provider.getData();
    const sport = R.find(R.propEq('id', sportId), data.sports);
    if (!sport) {
      throw new Error(`Not found sport for id ${sportId}`);
    }
    return {
      sport: formatSport(sport),
      events: R.pipe(
        R.map(formatEvent(sport)),
        sortByPos
      )(sport.events)
    };
  },
  async getOutcomes(sportId, eventId) {
    const data = await provider.getData();
    const sport = R.find(R.propEq('id', sportId), data.sports);
    if (!sport) {
      throw new Error(`Not found sport for id ${sportId}`);
    }
    const event = R.find(R.propEq('id', eventId), sport.events);
    if (!sport) {
      throw new Error(`Not found event for id ${eventId}`);
    }
    return {
      sport: formatSport(sport),
      event: formatEvent(sport)(event),
      outcomes: R.map(formatOutcome, event.outcomes)
    };
  }
});
