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
      const id = Number(req.params.id);
      format.eventsList(await service.getEvents(id));
    }
  });
