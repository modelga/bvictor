const R = require('ramda');
const links = require('./links');

const sortByPos = R.sortBy(R.prop('pos'));

module.exports = provider => ({
  async getSports() {
    const data = await provider.getData();
    return sortByPos(
      R.map(
        R.pipe(
          R.pick(['title', 'id', 'pos']),
          sport => R.assoc('self', links.resources.sportEvents(sport), sport)
        ),
        data.sports
      )
    );
  }
});
