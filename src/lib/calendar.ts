import { google } from 'googleapis';
import type { GAuthClient } from './google-auth';
import type { CalendarEvent } from './types';

function fmt(dateTime?: string | null, date?: string | null): string {
  if (dateTime) {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  if (date) return 'All Day';
  return '';
}

export async function fetchEvents(
  auth: GAuthClient,
  start: Date,
  end: Date,
  timezone: string,
): Promise<CalendarEvent[]> {
  const cal = google.calendar({ version: 'v3', auth: auth as Parameters<typeof google.calendar>[0]['auth'] });
  try {
    const res = await cal.events.list({
      calendarId: 'primary',
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
      timeZone: timezone,
    });

    return (res.data.items ?? [])
      .filter((e) => e.status !== 'cancelled')
      .map((e) => ({
        id: e.id ?? '',
        title: e.summary ?? 'Untitled',
        startTime: fmt(e.start?.dateTime, e.start?.date),
        endTime: fmt(e.end?.dateTime, e.end?.date),
        description: (e.description ?? '').slice(0, 300),
        location: e.location ?? '',
        attendees: (e.attendees ?? [])
          .filter((a) => a.responseStatus !== 'declined')
          .map((a) => a.displayName ?? a.email ?? '')
          .filter(Boolean),
        isAllDay: !e.start?.dateTime,
      }));
  } catch (err) {
    console.error('[calendar] fetch error:', err);
    return [];
  }
}

export function dayRange(offsetDays: number, timezone: string): { start: Date; end: Date } {
  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: timezone }),
  );
  const base = new Date(now);
  base.setDate(base.getDate() + offsetDays);
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);
  const end = new Date(base);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}
