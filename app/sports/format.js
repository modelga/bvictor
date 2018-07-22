const R = require('ramda');
const links = require('./links');

const AddSelf = R.curry((req, data) => ({
  ...data,
  links: {
    ...data.links,
    self: req.path
  }
}));

const AddParent = R.curry((req, parent, data) => ({
  ...data,
  links: {
    ...data.links,
    parent
  }
}));

const AddParentFromKey = R.curry((req, parentKey, data) =>
  AddParent(req, R.path([parentKey, 'self'], data), data)
);

const DefaultFormat = res => template => data => ({
  'application/json': function json() {
    res.json(data);
  },
  'text/html': function html() {
    res.render(template, data);
  },
  default() {
    res.render(template, data);
  }
});

module.exports = (req, res) => {
  const addSelf = AddSelf(req);
  const addParent = AddParent(req);
  const addParentFromKey = AddParentFromKey(req);
  const defaultFormat = DefaultFormat(res);
  const format = acceptTypes => res.format(acceptTypes);
  return {
    sportsList: R.pipe(
      addSelf,
      defaultFormat('sports-list'),
      format
    ),
    eventsList: R.pipe(
      addSelf,
      addParent(links.BASE),
      defaultFormat('events-list'),
      format
    ),
    outcomesList: R.pipe(
      addSelf,
      addParentFromKey('sport'),
      defaultFormat('outcomes-list'),
      format
    )
  };
};
