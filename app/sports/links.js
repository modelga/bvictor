const links = {
  BASE: '/sports',
  resources: {
    sportEvents(sport = {}) {
      return `${links.BASE}/${sport.id || ':sportId'}`;
    },
    sportOutcomes(sport, event = {}) {
      return `${links.resources.sportEvents(sport)}/events/${event.id ||
        ':eventId'}`;
    }
  }
};

module.exports = links;
