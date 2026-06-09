import Link from 'next/link';

function check(val: string | undefined): { ok: boolean; label: string } {
  return val ? { ok: true, label: '✅ Set' } : { ok: false, label: '❌ Missing' };
}

function Row({ name, status, note }: { name: string; status: { ok: boolean; label: string }; note: string }) {
  return (
    <tr>
      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 13 }}>{name}</td>
      <td style={{ padding: '8px 12px', color: status.ok ? '#16a34a' : '#dc2626' }}>{status.label}</td>
      <td style={{ padding: '8px 12px', color: '#6b7280', fontSize: 13 }}>{note}</td>
    </tr>
  );
}

export default function SetupPage() {
  const vars = {
    SLACK_BOT_TOKEN: check(process.env.SLACK_BOT_TOKEN),
    SLACK_CHANNEL_ID: check(process.env.SLACK_CHANNEL_ID),
    GOOGLE_CLIENT_ID: check(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: check(process.env.GOOGLE_CLIENT_SECRET),
    GOOGLE_REFRESH_TOKEN: check(process.env.GOOGLE_REFRESH_TOKEN),
    ANTHROPIC_API_KEY: check(process.env.ANTHROPIC_API_KEY),
    CRON_SECRET: check(process.env.CRON_SECRET),
  };

  const allSet = Object.values(vars).every((v) => v.ok);

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: 720, margin: '60px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>☀️ Daily Briefing — Setup</h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>
        Sends a Slack briefing every morning at <strong>7:00 AM SGT</strong> covering emails,
        calendar, partnerships, deadlines, follow-ups, draft replies, and one business idea.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Environment Variables</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafafa', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 13 }}>Variable</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 13 }}>Status</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 13 }}>Note</th>
          </tr>
        </thead>
        <tbody>
          <Row name="SLACK_BOT_TOKEN" status={vars.SLACK_BOT_TOKEN} note="xoxb-... from api.slack.com/apps (needs chat:write)" />
          <Row name="SLACK_CHANNEL_ID" status={vars.SLACK_CHANNEL_ID} note="Channel ID or your Slack User ID for DMs" />
          <Row name="GOOGLE_CLIENT_ID" status={vars.GOOGLE_CLIENT_ID} note="From Google Cloud Console OAuth2 credentials" />
          <Row name="GOOGLE_CLIENT_SECRET" status={vars.GOOGLE_CLIENT_SECRET} note="From Google Cloud Console OAuth2 credentials" />
          <Row name="GOOGLE_REFRESH_TOKEN" status={vars.GOOGLE_REFRESH_TOKEN} note="Get this by clicking Connect Google below" />
          <Row name="ANTHROPIC_API_KEY" status={vars.ANTHROPIC_API_KEY} note="sk-ant-... from console.anthropic.com" />
          <Row name="CRON_SECRET" status={vars.CRON_SECRET} note="Any random string — secures the /api/daily-briefing endpoint" />
        </tbody>
      </table>

      {allSet ? (
        <div style={{ marginTop: 24, padding: 16, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, color: '#15803d' }}>
          ✅ All variables are set. Your briefing will arrive every morning at 7:00 AM SGT.
        </div>
      ) : (
        <div style={{ marginTop: 24, padding: 16, background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, color: '#854d0e' }}>
          ⚠️ Some variables are missing. Add them in your Vercel project settings → Environment Variables, then redeploy.
        </div>
      )}

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 40, marginBottom: 12 }}>Step 1 — Connect Google Account</h2>
      <p style={{ color: '#374151', fontSize: 14, marginBottom: 16 }}>
        You need a Google Cloud project with Gmail API and Calendar API enabled, and OAuth2 credentials
        with the redirect URI set to{' '}
        <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
          {process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback
        </code>
      </p>
      <Link
        href="/api/auth/google"
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          background: '#4285f4',
          color: '#fff',
          borderRadius: 6,
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Connect Google Account →
      </Link>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 40, marginBottom: 12 }}>Step 2 — Set up Slack Bot</h2>
      <ol style={{ color: '#374151', fontSize: 14, lineHeight: 2 }}>
        <li>Go to <a href="https://api.slack.com/apps" style={{ color: '#4285f4' }}>api.slack.com/apps</a> → Create New App → From Scratch</li>
        <li>Under <strong>OAuth & Permissions</strong>, add scope: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>chat:write</code></li>
        <li>Install the app to your workspace and copy the <strong>Bot User OAuth Token</strong> (xoxb-…)</li>
        <li>Set <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>SLACK_CHANNEL_ID</code> to your Slack User ID for DMs, or a channel ID</li>
        <li>If posting to a channel, invite the bot to it: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>/invite @your-bot-name</code></li>
      </ol>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 40, marginBottom: 12 }}>Manual Trigger</h2>
      <p style={{ color: '#374151', fontSize: 14 }}>
        Once deployed, you can trigger a briefing immediately:
      </p>
      <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, fontSize: 12, overflow: 'auto', marginTop: 8 }}>
        {`curl -H "Authorization: Bearer $CRON_SECRET" \\
  https://your-app.vercel.app/api/daily-briefing`}
      </pre>

      <p style={{ marginTop: 40, color: '#9ca3af', fontSize: 12 }}>
        Cron schedule: <code>0 23 * * *</code> UTC = 7:00 AM SGT daily
      </p>
    </main>
  );
}
