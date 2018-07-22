class NotFound extends Error {}
class BadRequest extends Error {}

module.exports = {
  ex: {
    NotFound,
    BadRequest
  },
  // eslint-disable-next-line no-unused-vars
  handler(err, req, res, next) {
    if (err instanceof NotFound) {
      return res.status(404).send(`Not Found: ${err.message}`);
    }
    if (err instanceof BadRequest) {
      return res.status(400).send(`Bad Request: ${err.message}`);
    }
    return res.status(500).send(err.message);
  }
};
