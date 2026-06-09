import { NextRequest, NextResponse } from 'next/server';
import { getOAuthClient } from '@/lib/google-auth';
import { fetchRecentEmails } from '@/lib/gmail';
import { fetchEvents, dayRange } from '@/lib/calendar';
import { generateBriefing } from '@/lib/claude';
import { postBriefing } from '@/lib/slack';
import { fetchWeather } from '@/lib/weather';

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
    const yesterday = dayRange(-1, tz);
    const today = dayRange(0, tz);

    const [emails, yesterdayEvents, todayEvents, weather] = await Promise.all([
      fetchRecentEmails(oauth, 48),
      fetchEvents(oauth, yesterday.start, yesterday.end, tz),
      fetchEvents(oauth, today.start, today.end, tz),
      fetchWeather(),
    ]);

    console.log(
      `[briefing] ${dateStr} — ${emails.length} emails, ${yesterdayEvents.length} yesterday, ${todayEvents.length} today`,
    );

    const sections = await generateBriefing({
      emails,
      yesterdayEvents,
      todayEvents,
      currentDate: dateStr,
      timezone: tz,
    });

    await postBriefing(sections, dateStr, weather);

    return NextResponse.json({
      ok: true,
      date: dateStr,
      stats: { emails: emails.length, yesterdayEvents: yesterdayEvents.length, todayEvents: todayEvents.length },
    });
  } catch (err) {
    console.error('[briefing] fatal error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
