const WithSelf = req => (key, data) => ({
  [key]: data,
  links: { self: req.path }
});

module.exports = (req, res) => {
  const withSelf = WithSelf(req);
  return {
    sportsList(list) {
      return res.json(withSelf('sports', list));
    }
  };
};
