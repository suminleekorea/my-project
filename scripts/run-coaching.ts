import { getOAuthClient } from '../src/lib/google-auth.js';
import { fetchRecentEmails } from '../src/lib/gmail.js';
import { fetchEvents, dayRange } from '../src/lib/calendar.js';
import { generateCoaching } from '../src/lib/coaching.js';
import { postCoaching } from '../src/lib/slack.js';

async function main() {
  const tz = process.env.TIMEZONE ?? 'Asia/Singapore';

  const dateStr = new Date().toLocaleDateString('en-SG', {
    timeZone: tz,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  console.log(`[coaching] Running for ${dateStr} (${tz})`);

  const oauth = getOAuthClient();
  const today = dayRange(0, tz);
  const tomorrow = dayRange(1, tz);

  const [emails, todayEvents, tomorrowEvents] = await Promise.all([
    fetchRecentEmails(oauth, 48),
    fetchEvents(oauth, today.start, today.end, tz),
    fetchEvents(oauth, tomorrow.start, tomorrow.end, tz),
  ]);

  console.log(
    `[coaching] ${emails.length} emails · ${todayEvents.length} today · ${tomorrowEvents.length} tomorrow`,
  );

  const sections = await generateCoaching(emails, todayEvents, tomorrowEvents, dateStr, tz);

  await postCoaching(sections, dateStr);
  console.log('[coaching] Posted to Slack ✓');
}

main().catch((err) => {
  console.error('[coaching] Fatal error:', err);
  process.exit(1);
});
