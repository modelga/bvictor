const R = require('ramda');

const withTry = controller => async (req, res, next) => {
  try {
    await controller(req, res);
  } catch (e) {
    next(e);
  }
};

const withHandleErrors = R.map(withTry);

module.exports = service =>
  withHandleErrors({
    async sportsList(req, res) {
      res.json(await service.getSports());
    }
  });
