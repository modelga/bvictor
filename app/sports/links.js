const links = {
  BASE: '/sports',
  BASE_i18: lang => '/:lang/sports'.replace(':lang', lang),
  resources(lang) {
    return {
      sportEvents(sport = {}) {
        const langBase = links.BASE_i18(lang);
        return `${langBase}/${sport.id || ':sportId'}`;
      },
      sportOutcomes(sport, event = {}) {
        const sportsBase = links.resources(lang).sportEvents(sport);
        return `${sportsBase}/events/${event.id || ':eventId'}`;
      }
    };
  }
};

module.exports = links;
