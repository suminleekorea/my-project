import Anthropic from '@anthropic-ai/sdk';
import type { BriefingInput, BriefingSections, DraftReply } from './types';

const client = new Anthropic();

const SYSTEM = `You are a sharp executive assistant writing a morning briefing. Be direct, specific, and prioritise what matters. For draft replies, write exactly as the person would — no sign-off padding, no "I hope this email finds you well". Return valid JSON only, no markdown fences.`;

export async function generateBriefing(input: BriefingInput): Promise<BriefingSections> {
  const emailBlock = input.emails
    .slice(0, 25)
    .map(
      (e) =>
        `FROM: ${e.from}\nSUBJECT: ${e.subject}\nDATE: ${e.date}\nUNREAD: ${e.isUnread} | IMPORTANT: ${e.isImportant}\nSNIPPET: ${e.snippet}\n${e.body ? `BODY: ${e.body}` : ''}`,
    )
    .join('\n---\n');

  const fmtEvents = (evs: typeof input.todayEvents) =>
    evs.length
      ? evs
          .map(
            (e) =>
              `• ${e.startTime}${e.endTime ? `–${e.endTime}` : ''}: ${e.title}${e.location ? ` @ ${e.location}` : ''}${e.attendees.length ? ` (${e.attendees.join(', ')})` : ''}${e.description ? ` | ${e.description}` : ''}`,
          )
          .join('\n')
      : 'None';

  const prompt = `Today is ${input.currentDate} (${input.timezone}).

EMAILS (last 48h):
${emailBlock || 'No emails.'}

YESTERDAY'S CALENDAR:
${fmtEvents(input.yesterdayEvents)}

TODAY'S CALENDAR:
${fmtEvents(input.todayEvents)}

Generate a morning briefing. Return a single JSON object — no prose outside the JSON:

{
  "yesterdaySummary": "3-5 bullet points (• prefix) covering key emails received, meetings held, and anything notable. Be specific with names and topics.",
  "brandPartnerships": "Any sponsorship threads, partnership inbound, collabs, or brand deal movement found in emails. Flag what's waiting on a reply. If none: 'No active threads.'",
  "deadlines": "Anything due TODAY — from emails mentioning due dates or calendar events requiring deliverables. Be specific. If none: 'Clear today.'",
  "todaysSchedule": "Every calendar event in order. For each, include time, title, location/link, attendees, and one prep note if relevant (e.g. 'bring deck', 'confirm attendance', 'review contract first').",
  "pendingFollowups": "Email threads received but not replied to, and any flagged items. List sender + subject + how many days old.",
  "draftReplies": [
    {
      "originalSender": "Name <email>",
      "subject": "subject line",
      "draft": "Full ready-to-send reply text in first person. Concise and direct."
    }
  ],
  "businessIdea": "ONE specific, actionable opportunity worth acting on THIS WEEK based on patterns across emails and calendar. Name the specific person, brand, or event it connects to. Why now. What to do."
}

Rules:
- draftReplies: pick the top 3 most urgent unread emails only. Empty array if none.
- Be concrete — names, numbers, dates, not vague summaries.
- businessIdea must be specific and novel, not "follow up on X email".`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonStr) throw new Error('No JSON in response');
    const parsed = JSON.parse(jsonStr);

    return {
      yesterdaySummary: parsed.yesterdaySummary ?? '—',
      brandPartnerships: parsed.brandPartnerships ?? 'No active threads.',
      deadlines: parsed.deadlines ?? 'Clear today.',
      todaysSchedule: parsed.todaysSchedule ?? fmtEvents(input.todayEvents),
      pendingFollowups: parsed.pendingFollowups ?? 'None.',
      draftReplies: (Array.isArray(parsed.draftReplies) ? parsed.draftReplies : []) as DraftReply[],
      businessIdea: parsed.businessIdea ?? '—',
    };
  } catch (err) {
    console.error('[claude] synthesis error:', err);
    return {
      yesterdaySummary: '⚠️ Could not generate summary.',
      brandPartnerships: '⚠️ Could not fetch.',
      deadlines: '⚠️ Could not fetch.',
      todaysSchedule: fmtEvents(input.todayEvents),
      pendingFollowups: '⚠️ Could not fetch.',
      draftReplies: [],
      businessIdea: '⚠️ Could not generate.',
    };
  }
}
