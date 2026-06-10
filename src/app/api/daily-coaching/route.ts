import { NextRequest, NextResponse } from 'next/server';
import { getOAuthClient } from '@/lib/google-auth';
import { fetchRecentEmails } from '@/lib/gmail';
import { fetchEvents, dayRange } from '@/lib/calendar';
import { generateCoaching } from '@/lib/coaching';
import { postCoaching } from '@/lib/slack';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tz = process.env.TIMEZONE ?? 'Asia/Singapore';

  try {
    const dateStr = new Date().toLocaleDateString('en-SG', {
      timeZone: tz,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const oauth = getOAuthClient();
    const today = dayRange(0, tz);
    const tomorrow = dayRange(1, tz);

    const [emails, todayEvents, tomorrowEvents] = await Promise.all([
      fetchRecentEmails(oauth, 48),
      fetchEvents(oauth, today.start, today.end, tz),
      fetchEvents(oauth, tomorrow.start, tomorrow.end, tz),
    ]);

    console.log(
      `[coaching] ${dateStr} — ${emails.length} emails, ${todayEvents.length} today, ${tomorrowEvents.length} tomorrow`,
    );

    const sections = await generateCoaching(emails, todayEvents, tomorrowEvents, dateStr, tz);

    await postCoaching(sections, dateStr);

    return NextResponse.json({
      ok: true,
      date: dateStr,
      stats: { emails: emails.length, todayEvents: todayEvents.length, tomorrowEvents: tomorrowEvents.length },
    });
  } catch (err) {
    console.error('[coaching] fatal error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
