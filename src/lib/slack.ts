import { WebClient } from '@slack/web-api';
import type { BriefingSections, CityWeather } from './types';
import { formatWeather } from './weather';

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

export async function postBriefing(
  sections: BriefingSections,
  dateStr: string,
  weather: CityWeather[] = [],
): Promise<void> {
  const draftText = sections.draftReplies.length
    ? sections.draftReplies
        .map(
          (r, i) =>
            `*Draft ${i + 1} — Re: ${r.subject}* → ${r.originalSender}\n>${r.draft.replace(/\n/g, '\n>')}`,
        )
        .join('\n\n')
    : 'No urgent emails requiring a reply right now.';

  const weatherText = formatWeather(weather);

  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `☀️ Morning Briefing — ${dateStr}`, emoji: true },
    },
    divider,
    ...(weatherText ? [section('🌡️', 'Weather', weatherText), divider] : []),
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

  // Diagnostic: log which workspace this bot is actually installed in.
  // Helps catch the common "wrong workspace" mistake where SLACK_CHANNEL_ID
  // is a user ID from a different workspace than the bot.
  try {
    const auth = await slack.auth.test();
    console.log(`[slack] Bot installed in workspace: "${auth.team}" (team ${auth.team_id})`);
  } catch (err) {
    console.error('[slack] auth.test failed — check SLACK_BOT_TOKEN:', err);
  }

  let channelId = (process.env.SLACK_CHANNEL_ID ?? '').trim();

  if (channelId.includes('@')) {
    // Treat as an email — resolve to the user in THIS bot's workspace.
    // Robust across workspaces (requires users:read.email scope).
    const found = await slack.users.lookupByEmail({ email: channelId });
    const userId = found.user?.id;
    if (!userId) throw new Error(`No Slack user found for email ${channelId}`);
    const dm = await slack.conversations.open({ users: userId });
    channelId = dm.channel?.id ?? userId;
  } else if (channelId.startsWith('U') || channelId.startsWith('W')) {
    // User ID — open a DM channel to it.
    const dm = await slack.conversations.open({ users: channelId });
    channelId = dm.channel?.id ?? channelId;
  }
  // Otherwise assume it's already a channel ID (C.../G.../D...) and post directly.

  await slack.chat.postMessage({
    channel: channelId,
    text: `☀️ Morning Briefing — ${dateStr}`,
    blocks: blocks.slice(0, 50),
  });

  console.log(`[slack] Briefing posted to ${channelId}`);
}
