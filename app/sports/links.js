const R = require('ramda');

const links = {
  BASE: '/sports',
  resources: {
    sportEvents(sport) {
      return `${links.BASE}/${(sport || {}).id || ':id'}`;
    },
    sportOutcomes(sport, event) {
      return `${links.resources.sportEvents(sport)}/events/${event.id ||
        ':eid'}`;
    }
  }
};

module.exports = links;
