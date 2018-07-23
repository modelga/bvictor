const axios = require('axios');
const debug = require('debug');

const log = debug('bet-victor:sports-live:provider');
const Cache = require('../cache');

module.exports = config =>
  Cache(config, async lang => {
    log('Refresh live data');
    try {
      const response = await axios.get(
        `${config.get('UPSTREAM_BASE_URL')}/${lang}/live/live/list.json`
      );
      if (response.headers['content-type'].indexOf('text/') !== -1) {
        throw new Error('Cannot fetch data from upstream');
      }
      return response.data;
    } catch (e) {
      log('Failed to refresh', e.text);
      throw e;
    }
  });
