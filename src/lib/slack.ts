import { WebClient } from '@slack/web-api';
import type { BriefingSections } from './types';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

function cap(text: string, max = 2900): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

function section(emoji: string, title: string, body: string) {
  return {
    type: 'section',
    text: { type: 'mrkdwn', text: cap(`*${emoji} ${title}*\n${body}`) },
  };
}

const divider = { type: 'divider' };

export async function postBriefing(sections: BriefingSections, dateStr: string): Promise<void> {
  const draftText = sections.draftReplies.length
    ? sections.draftReplies
        .map(
          (r, i) =>
            `*Draft ${i + 1} — Re: ${r.subject}* → ${r.originalSender}\n>${r.draft.replace(/\n/g, '\n>')}`,
        )
        .join('\n\n')
    : 'No urgent emails requiring a reply right now.';

  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `☀️ Morning Briefing — ${dateStr}`, emoji: true },
    },
    divider,
    section('📋', 'Yesterday at a Glance', sections.yesterdaySummary),
    divider,
    section('🤝', 'Brand & Partnership Updates', sections.brandPartnerships),
    divider,
    section('⏰', 'Deadlines & Deliverables Today', sections.deadlines),
    divider,
    section('📅', "Today's Schedule", sections.todaysSchedule),
    divider,
    section('🔄', 'Pending Follow-ups', sections.pendingFollowups),
    divider,
    section('✉️', 'Draft Replies', draftText),
    divider,
    section('💡', 'One Idea Worth Acting On This Week', sections.businessIdea),
    divider,
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `_Generated ${new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore', dateStyle: 'medium', timeStyle: 'short' })} SGT_`,
        },
      ],
    },
  ];

  await slack.chat.postMessage({
    channel: process.env.SLACK_CHANNEL_ID!,
    text: `☀️ Morning Briefing — ${dateStr}`,
    blocks: blocks.slice(0, 50),
  });
}
