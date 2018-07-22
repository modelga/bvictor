const R = require('ramda');
const links = require('./links');
const langs = require('../common/langs');

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

const AddSelfLinksInLangs = req => data => {
  const { self } = data.links;
  const i18 = R.map(
    ({ lang, name }) => ({
      link: self.replace(req.params.lang, lang),
      name,
      lang
    }),
    langs
  );
  return { ...data, i18 };
};

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
  const addSelfLinksInLangs = AddSelfLinksInLangs(req);
  const addSelf = AddSelf(req);
  const addParent = AddParent(req);
  const addParentFromKey = AddParentFromKey(req);
  const defaultFormat = DefaultFormat(res);

  const format = acceptTypes => res.format(acceptTypes);
  return {
    sportsList: R.pipe(
      addSelf,
      addSelfLinksInLangs,
      defaultFormat('sports-list'),
      format
    ),
    eventsList: R.pipe(
      addSelf,
      addParent(links.BASE_i18(req.params.lang)),
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
