const R = require('ramda');
const links = require('./links');

const sortByPos = R.sortBy(R.prop('pos'));

module.exports = provider => ({
  async getSports() {
    const data = await provider.getData();
    return sortByPos(
      R.map(
        R.pipe(
          sport => R.assoc('events_count', (sport.events || []).length, sport),
          R.pick(['title', 'id', 'pos', 'events_count']),
          sport => R.assoc('self', links.resources.sportEvents(sport), sport)
        ),
        data.sports
      )
    );
  }
});
