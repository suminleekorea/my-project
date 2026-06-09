import { google } from 'googleapis';
import type { GAuthClient } from './google-auth';
import type { CalendarEvent } from './types';

function fmt(dateTime?: string | null, date?: string | null, timezone?: string): string {
  if (dateTime) {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
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
        startTime: fmt(e.start?.dateTime, e.start?.date, timezone),
        endTime: fmt(e.end?.dateTime, e.end?.date, timezone),
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
  // Get today's date in the target timezone
  const localDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
  const [y, m, d] = localDateStr.split('-').map(Number);

  // Compute target date (handles month/year overflow)
  const target = new Date(Date.UTC(y, m - 1, d + offsetDays));
  const ty = target.getUTCFullYear();
  const tm = String(target.getUTCMonth() + 1).padStart(2, '0');
  const td = String(target.getUTCDate()).padStart(2, '0');

  // Find the UTC offset for this timezone at noon of the target day
  const ref = new Date(`${ty}-${tm}-${td}T12:00:00Z`);
  const tzStr = ref.toLocaleString('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  // Parse the tz wall-clock representation as UTC to measure the offset
  const [datePart, timePart] = tzStr.split(', ');
  const [mo, dy, yr] = datePart.split('/');
  const tzAsUtcMs = Date.parse(`${yr}-${mo}-${dy}T${timePart}Z`);
  const offsetMs = tzAsUtcMs - ref.getTime(); // positive for UTC+ zones

  // Midnight of target day in the timezone = UTC midnight minus the offset
  const start = new Date(Date.parse(`${ty}-${tm}-${td}T00:00:00Z`) - offsetMs);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);

  return { start, end };
}
