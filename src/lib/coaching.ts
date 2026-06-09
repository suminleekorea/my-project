import Anthropic from '@anthropic-ai/sdk';
import type { EmailThread, CalendarEvent } from './types';

const client = new Anthropic();

export interface CoachingSections {
  focusWindow: string;
  patternObservation: string;
  watchOut: string;
  oneCommitment: string;
  energyTip: string;
}

const SYSTEM = `You are an ADHD-aware executive coach who is warm, direct, and practical. You observe behavioral patterns from calendar and email data and give specific, actionable nudges. You know the user is a startup founder in Singapore with ADHD. You never lecture. You give short, crisp guidance that a person with ADHD can actually use. Return valid JSON only, no markdown fences.`;

interface ScheduleStats {
  totalMeetings: number;
  backToBack: number;
  eveningEvents: number;
  longestGap: { start: string; end: string; durationMins: number } | null;
  firstEventTime: string | null;
  lastEventTime: string | null;
}

function analyzeSchedule(events: CalendarEvent[]): ScheduleStats {
  const sorted = [...events]
    .filter((e) => !e.isAllDay && e.startTime)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  let backToBack = 0;
  let eveningEvents = 0;
  let longestGap: { start: string; end: string; durationMins: number } | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const e = sorted[i];
    const hour = parseInt(e.startTime.split(':')[0] ?? '0', 10);
    if (hour >= 18) eveningEvents++;

    if (i > 0) {
      const prev = sorted[i - 1];
      if (prev.endTime && e.startTime) {
        const [ph, pm] = prev.endTime.split(':').map(Number);
        const [sh, sm] = e.startTime.split(':').map(Number);
        const gapMins = sh * 60 + sm - (ph * 60 + pm);
        if (gapMins >= 0 && gapMins <= 10) backToBack++;
        if (gapMins > 30) {
          if (!longestGap || gapMins > longestGap.durationMins) {
            longestGap = { start: prev.endTime, end: e.startTime, durationMins: gapMins };
          }
        }
      }
    }
  }

  return {
    totalMeetings: sorted.length,
    backToBack,
    eveningEvents,
    longestGap,
    firstEventTime: sorted[0]?.startTime ?? null,
    lastEventTime: sorted[sorted.length - 1]?.endTime ?? sorted[sorted.length - 1]?.startTime ?? null,
  };
}

function fmtEvents(evs: CalendarEvent[]): string {
  const timed = evs.filter((e) => !e.isAllDay);
  if (!timed.length) return 'No timed events';
  return timed
    .map(
      (e) =>
        `• ${e.startTime}${e.endTime ? `–${e.endTime}` : ''}: ${e.title}${e.location ? ` @ ${e.location}` : ''}`,
    )
    .join('\n');
}

export async function generateCoaching(
  emails: EmailThread[],
  todayEvents: CalendarEvent[],
  tomorrowEvents: CalendarEvent[],
  currentDate: string,
  timezone: string,
): Promise<CoachingSections> {
  const schedule = analyzeSchedule(todayEvents);
  const unreadCount = emails.filter((e) => e.isUnread).length;
  const oldUnreplied = emails
    .filter((e) => e.isUnread)
    .slice(0, 5)
    .map((e) => `• ${e.from.split('<')[0].trim()} — "${e.subject}" (${e.date})`)
    .join('\n');

  const scheduleStats = [
    `Total meetings today: ${schedule.totalMeetings}`,
    `Back-to-back (≤10 min gap): ${schedule.backToBack}`,
    `Evening events (6 PM+): ${schedule.eveningEvents}`,
    schedule.longestGap
      ? `Longest free block: ${schedule.longestGap.start}–${schedule.longestGap.end} (${schedule.longestGap.durationMins} min)`
      : 'No clear free block',
    `Day starts: ${schedule.firstEventTime ?? 'no events'} | Ends: ${schedule.lastEventTime ?? 'no events'}`,
  ].join('\n');

  const prompt = `Today is ${currentDate} (${timezone}).

SCHEDULE STATS:
${scheduleStats}

TODAY'S EVENTS:
${fmtEvents(todayEvents)}

TOMORROW'S EVENTS (preview):
${fmtEvents(tomorrowEvents)}

UNREAD EMAILS: ${unreadCount} unread in last 48h
OLDEST UNREAD (top 5):
${oldUnreplied || 'None'}

You are coaching someone with ADHD who tends to over-schedule, double-book evenings, and delay email replies. They work in Singapore in AI/startups and e-commerce (Shopee). They are in an early-phase mindset — building new things, establishing routines. Think: The First 90 Days framework.

Generate a short, ADHD-friendly morning coaching nudge. Return a single JSON object:

{
  "focusWindow": "Identify the BEST single time block for deep focused work today based on calendar gaps. Give specific time (e.g. '9:00–10:30 AM — 90 min free before your first meeting'). If no good gap: suggest earliest morning before anything starts.",
  "patternObservation": "ONE specific behavioral pattern you notice in today's data. Be concrete (e.g. '3 back-to-back meetings this afternoon means you'll be drained by 4 PM' or 'You have a 7 PM event again — watch the evening double-booking habit'). Max 2 sentences.",
  "watchOut": "The single biggest ADHD risk TODAY — hyperfocus trap, transition time, over-commitment. One sentence, direct.",
  "oneCommitment": "ONE specific, small action to commit to completing before noon. Must be doable in under 20 minutes. Phrase as: 'Before noon: [specific action]'.",
  "energyTip": "A practical ADHD energy management tip for today based on the schedule pattern. Concrete, not generic. E.g. body-double tip, reset ritual between meetings, or when to do the hardest email."
}

Rules:
- Be specific to TODAY's actual data, not generic advice
- Short sentences. Scannable. No paragraphs.
- Warm and encouraging tone, never lecturing
- focusWindow must name actual times from the schedule`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonStr) throw new Error('No JSON in response');
    const parsed = JSON.parse(jsonStr);

    return {
      focusWindow: parsed.focusWindow ?? '—',
      patternObservation: parsed.patternObservation ?? '—',
      watchOut: parsed.watchOut ?? '—',
      oneCommitment: parsed.oneCommitment ?? '—',
      energyTip: parsed.energyTip ?? '—',
    };
  } catch (err) {
    console.error('[coaching] synthesis error:', err);
    return {
      focusWindow: '⚠️ Could not generate.',
      patternObservation: '⚠️ Could not generate.',
      watchOut: '⚠️ Could not generate.',
      oneCommitment: '⚠️ Could not generate.',
      energyTip: '⚠️ Could not generate.',
    };
  }
}
