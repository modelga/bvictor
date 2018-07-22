const axios = require('axios');
const debug = require('debug');

const log = debug('bet-victor:sports-live:provider');
const Cache = require('../cache');

module.exports = config => {
  const getData = async lang => {
    log('Refresh live data');
    const response = await axios.get(
      `${config.get('UPSTREAM_BASE_URL')}/${lang}/live/live/list.json`
    );
    return response.data;
  };
  const getDataWithCache = Cache(config, getData);

  return { getData: getDataWithCache };
};
