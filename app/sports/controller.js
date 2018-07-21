const R = require('ramda');
const Format = require('./format');

const withTry = controller => async (req, res, next) => {
  try {
    await controller(req, Format(req, res));
  } catch (e) {
    next(e);
  }
};

const withHandleErrors = R.map(withTry);

module.exports = service =>
  withHandleErrors({
    async sportsList(req, format) {
      format.sportsList(await service.getSports());
    }
  });
