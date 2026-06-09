import { getOAuthClient } from '../src/lib/google-auth.js';
import { fetchRecentEmails } from '../src/lib/gmail.js';
import { fetchEvents, dayRange } from '../src/lib/calendar.js';
import { generateBriefing } from '../src/lib/claude.js';
import { postBriefing } from '../src/lib/slack.js';
import { fetchWeather } from '../src/lib/weather.js';

async function main() {
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

  const [emails, yesterdayEvents, todayEvents, weather] = await Promise.all([
    fetchRecentEmails(oauth, 48),
    fetchEvents(oauth, yesterday.start, yesterday.end, tz),
    fetchEvents(oauth, today.start, today.end, tz),
    fetchWeather(),
  ]);

  console.log(
    `[briefing] ${emails.length} emails · ${yesterdayEvents.length} yesterday · ${todayEvents.length} today · ${weather.length} cities weather`,
  );

  const sections = await generateBriefing({
    emails,
    yesterdayEvents,
    todayEvents,
    currentDate: dateStr,
    timezone: tz,
  });

  await postBriefing(sections, dateStr, weather);
  console.log('[briefing] Posted to Slack ✓');
}

main().catch((err) => {
  console.error('[briefing] Fatal error:', err);
  process.exit(1);
});
