const axios = require('axios');

module.exports = config => ({
  async getData() {
    const response = await axios.get(
      `${config.get('UPSTREAM_BASE_URL')}/en-gb/live/live/list.json`
    );
    return response.data;
  }
});
