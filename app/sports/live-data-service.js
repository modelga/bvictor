const R = require('ramda');

module.exports = provider => ({
  async getSports() {
    const data = await provider.getData();
    return R.map(R.pick(['title', 'id']), data.sports);
  }
});
