const { superstruct } = require('superstruct');
const R = require('ramda');
const { ex } = require('../error');

const struct = superstruct({
  types: {
    numberlike: value => !Number.isNaN(Number(value))
  }
});

const validate = requestType => (req, res, next) => {
  try {
    requestType(req.params);
    next();
  } catch (e) {
    next(new ex.BadRequest(e.message));
  }
};

const langs = require('../common/langs');

const lang = { lang: struct.enum(R.pluck('lang', langs)) };
const sportId = { sportId: 'numberlike' };
const eventId = { eventId: 'numberlike' };

module.exports = {
  types: {
    sports: struct({ ...lang }),
    events: struct({ ...lang, ...sportId }),
    outcomes: struct({ ...lang, ...sportId, ...eventId })
  },
  validate
};
