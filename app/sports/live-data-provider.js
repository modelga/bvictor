const axios = require('axios');
const debug = require('debug');

const log = debug('bet-victor:sports-live:provider');
const Cache = require('../cache');

module.exports = config => {
  const getData = async () => {
    log('Refresh live data');
    const response = await axios.get(
      `${config.get('UPSTREAM_BASE_URL')}/en-gb/live/live/list.json`
    );
    return response.data;
  };
  const getDataWithCache = Cache(config, getData);

  return { getData: getDataWithCache };
};
