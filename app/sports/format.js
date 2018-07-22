const WithSelf = req => (key, data) => ({
  [key]: data,
  links: { self: req.path }
});

module.exports = (req, res) => {
  const withSelf = WithSelf(req);
  return {
    sportsList(list) {
      const data = withSelf('sports', list);
      res.format({
        'application/json': function json() {
          res.json(data);
        },
        'text/html': function html() {
          res.render('sports-list.hbs', data);
        },
        default() {
          res.render('sports-list.hbs', data);
        }
      });
    }
  };
};
