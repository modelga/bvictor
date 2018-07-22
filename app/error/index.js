class NotFound extends Error {}

module.exports = {
  ex: {
    NotFound
  },
  // eslint-disable-next-line no-unused-vars
  handler(err, req, res, next) {
    if (err instanceof NotFound) {
      return res.status(404).send(`Not Found: ${err.message}`);
    }
    return res.status(500).send(err.message);
  }
};
