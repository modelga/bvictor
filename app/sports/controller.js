const R = require('ramda');
const Format = require('./format');

const withTryAndFormat = controller => async (req, res, next) => {
  try {
    await controller(req, Format(req, res));
  } catch (e) {
    next(e);
  }
};

const withHandleErrors = R.map(withTryAndFormat);

module.exports = service =>
  withHandleErrors({
    async sportsList(req, format) {
      format.sportsList(await service.getSports());
    },
    async eventsList(req, format) {
      const sportId = Number(req.params.sportId);
      format.eventsList(await service.getEvents(sportId));
    },
    async outcomesList(req, format) {
      const sportId = Number(req.params.sportId);
      const eventId = Number(req.params.eventId);
      format.outcomesList(await service.getOutcomes(sportId, eventId));
    }
  });
