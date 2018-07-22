const R = require('ramda');
const links = require('./links');
const { ex } = require('../error');

const sortByPos = R.sortBy(R.prop('pos'));

const FormatSport = R.curry((lang, sport) =>
  R.pipe(
    R.assoc('events_count', sport.events.length),
    R.assoc(
      'total_outcomes',
      R.pipe(
        R.prop('events'),
        R.pluck('total_outcomes'),
        R.sum
      )(sport)
    ),
    R.pick(['title', 'id', 'pos', 'events_count', 'total_outcomes']),
    R.assoc('self', links.resources(lang).sportEvents(sport))
  )(sport)
);

const FormatEvent = R.curry((lang, sport, event) =>
  R.pipe(
    R.pick(['status', 'title', 'id', 'pos', 'total_outcomes', 'score']),
    R.assoc('self', links.resources(lang).sportOutcomes(sport, event))
  )(event)
);

const formatOutcome = R.pick([
  'id',
  'description',
  'price',
  'price_decimal',
  'price_id'
]);

module.exports = provider => ({
  async getSports(lang) {
    const data = await provider.getData(lang);
    return {
      sports: R.pipe(
        R.map(FormatSport(lang)),
        sortByPos
      )(data.sports)
    };
  },
  async getEvents(lang, sportId) {
    const data = await provider.getData(lang);
    const sport = R.find(R.propEq('id', sportId), data.sports);
    if (!sport) {
      throw new ex.NotFound(`Sport for id ${sportId}`);
    }
    return {
      sport: FormatSport(lang, sport),
      events: R.pipe(
        R.map(FormatEvent(lang, sport)),
        sortByPos
      )(sport.events)
    };
  },
  async getOutcomes(lang, sportId, eventId) {
    const data = await provider.getData(lang);
    const sport = R.find(R.propEq('id', sportId), data.sports);
    if (!sport) {
      throw new ex.NotFound(`Sport for id ${sportId}`);
    }
    const event = R.find(R.propEq('id', eventId), sport.events);
    if (!event) {
      throw new ex.NotFound(`Event for id ${eventId}`);
    }
    return {
      sport: FormatSport(lang, sport),
      event: FormatEvent(lang, sport, event),
      outcomes: R.map(formatOutcome, event.outcomes)
    };
  }
});
