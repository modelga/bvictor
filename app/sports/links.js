const links = {
  BASE: '/sports',
  resources: {
    sportEvents: ({ id }) => `${links.BASE}/${id}`
  }
};

module.exports = links;
