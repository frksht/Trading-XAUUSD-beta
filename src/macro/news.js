const HIGH_IMPACT_EVENTS = [
  { event: 'NFP', keywords: ['non farm', 'nfp', 'employment'] },
  { event: 'CPI', keywords: ['cpi', 'consumer price'] },
  { event: 'Core PCE', keywords: ['core pce', 'pce'] },
  { event: 'FOMC', keywords: ['fomc', 'fed rate'] },
  { event: 'Fed Press Conference', keywords: ['fed press', 'powell'] },
];

const USD_EVENTS = [...HIGH_IMPACT_EVENTS];

let cachedEvents = [];

export function setEvents(events) {
  cachedEvents = events;
}

export function getEvents() {
  return [...cachedEvents];
}

export function isHighImpactEvent(eventName) {
  const lower = eventName.toLowerCase();
  return HIGH_IMPACT_EVENTS.some(e =>
    e.keywords.some(k => lower.includes(k))
  );
}

export function checkUpcomingNews(minutes = 30) {
  const now = Date.now();
  const upcoming = cachedEvents.filter(e => {
    const eventTime = new Date(e.date).getTime();
    const diff = eventTime - now;
    return diff > 0 && diff <= minutes * 60 * 1000;
  });

  if (upcoming.length === 0) {
    return { blocked: false, reason: null, upcoming: [] };
  }

  const details = upcoming.map(e => `${e.event} at ${e.date}`).join(', ');
  return {
    blocked: true,
    reason: `NO TRADE — HIGH IMPACT NEWS RISK: ${details}`,
    upcoming,
  };
}

export function getBlockedEvents() {
  return HIGH_IMPACT_EVENTS.map(e => e.event);
}
