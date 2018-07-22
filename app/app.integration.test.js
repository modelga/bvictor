const componentTests = require('./app.component.suite.test');
const integrationTests = require('./app.integration.suite.test');

const config = {
  get(key) {
    if (key === 'UPSTREAM_BASE_URL') return process.env.UPSTREAM_BASE_URL;
    if (key === 'CACHE_ENGINE') return 'in-memory';
    if (key === 'CACHE_TTL_SECONDS') return 1;
    if (key === 'DEFAULT_LANG') return 'en-gb';
    throw new Error(`Invalid test config key: ${key}`);
  }
};

integrationTests(config);
componentTests(config);
