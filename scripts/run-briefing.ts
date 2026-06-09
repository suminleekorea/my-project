import { getOAuthClient } from '../src/lib/google-auth.js';
import { fetchRecentEmails } from '../src/lib/gmail.js';
import { fetchEvents, dayRange } from '../src/lib/calendar.js';
import { generateBriefing } from '../src/lib/claude.js';
import { postBriefing } from '../src/lib/slack.js';

const tz = process.env.TIMEZONE ?? 'Asia/Singapore';

const dateStr = new Date().toLocaleDateString('en-SG', {
  timeZone: tz,
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

console.log(`[briefing] Running for ${dateStr} (${tz})`);

const oauth = getOAuthClient();
const yesterday = dayRange(-1, tz);
const today = dayRange(0, tz);

const [emails, yesterdayEvents, todayEvents] = await Promise.all([
  fetchRecentEmails(oauth, 48),
  fetchEvents(oauth, yesterday.start, yesterday.end, tz),
  fetchEvents(oauth, today.start, today.end, tz),
]);

console.log(
  `[briefing] ${emails.length} emails · ${yesterdayEvents.length} yesterday · ${todayEvents.length} today`,
);

const sections = await generateBriefing({
  emails,
  yesterdayEvents,
  todayEvents,
  currentDate: dateStr,
  timezone: tz,
});

await postBriefing(sections, dateStr);
console.log('[briefing] Posted to Slack ✓');
