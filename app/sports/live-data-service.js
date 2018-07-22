const R = require('ramda');
const links = require('./links');

const sortByPos = R.sortBy(R.prop('pos'));

const formatSport = R.pipe(
  sport => R.assoc('events_count', (sport.events || []).length, sport),
  R.pick(['title', 'id', 'pos', 'events_count']),
  sport => R.assoc('self', links.resources.sportEvents(sport), sport)
);

const formatEvent = sport =>
  R.pipe(
    R.pick(['status', 'title', 'id', 'pos', 'total_outcomes']),
    event => R.assoc('self', links.resources.sportOutcomes(sport, event), event)
  );

module.exports = provider => ({
  async getSports() {
    const data = await provider.getData();
    return sortByPos(R.map(formatSport, data.sports));
  },
  async getEvents(id) {
    const data = await provider.getData();
    const sport = R.find(R.propEq('id', id), data.sports);
    if (!sport) {
      throw new Error(`Not found sport for id ${id}`);
    }
    return {
      sport: formatSport(sport),
      events: R.pipe(
        R.map(formatEvent(sport)),
        sortByPos
      )(sport.events)
    };
  }
});
