const R = require('ramda');
const Format = require('./format');
const links = require('./links');

const withTryAndFormat = controller => async (req, res, next) => {
  try {
    await controller(req, Format(req, res), res);
  } catch (e) {
    next(e);
  }
};

const withHandleErrors = R.map(withTryAndFormat);

module.exports = (config, service) => {
  const getLang = req => req.params.lang || config.get('DEFAULT_LANG');
  return withHandleErrors({
    async sportsRedirect(req, format, res) {
      res.redirect(links.BASE_i18(config.get('DEFAULT_LANG')));
    },
    async sportsList(req, format) {
      const sports = await service.getSports(getLang(req));
      format.sportsList(sports);
    },
    async eventsList(req, format) {
      const sportId = Number(req.params.sportId);
      const events = await service.getEvents(getLang(req), sportId);
      format.eventsList(events);
    },
    async outcomesList(req, format) {
      const sportId = Number(req.params.sportId);
      const eventId = Number(req.params.eventId);
      const events = await service.getOutcomes(getLang(req), sportId, eventId);
      format.outcomesList(events);
    }
  });
};
