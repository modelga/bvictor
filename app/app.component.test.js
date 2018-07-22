const fs = require('fs');
const path = require('path');
const componentTests = require('./app.component.suite.test');

const fixtures = async lang =>
  JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '..', `fixtures/${lang || 'en-gb'}.json`)
    )
  );

const config = {
  get(key) {
    if (key === 'UPSTREAM_BASE_URL')
      return process.env.UPSTREAM || 'https://betvictor-proxy.herokuapp.com';
    if (key === 'CACHE_ENGINE') return fixtures;
    if (key === 'DEFAULT_LANG') return 'en-gb';
    throw new Error(`Invalid test config key: ${key}`);
  }
};
componentTests(config);
