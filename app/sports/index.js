const { Router } = require('express');
const links = require('./links');
const LiveDataService = require('./live-data-service');
const LiveDataProvider = require('./live-data-provider');
const Controller = require('./controller');

module.exports = config => {
  const app = Router();
  const liveDataProvider = LiveDataProvider(config);
  const liveDataService = LiveDataService(liveDataProvider);
  const controller = Controller(config, liveDataService);

  app.get(links.BASE, controller.sportsRedirect);
  app.get(links.BASE_i18(':lang'), controller.sportsList);
  app.get(links.resources(':lang').sportEvents(), controller.eventsList);
  app.get(links.resources(':lang').sportOutcomes(), controller.outcomesList);

  return app;
};
