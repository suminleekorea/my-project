import { NextRequest, NextResponse } from 'next/server';
import { getOAuthClient } from '@/lib/google-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return new NextResponse('<h2>Error: no code returned by Google</h2>', {
      headers: { 'Content-Type': 'text/html' },
      status: 400,
    });
  }

  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      return new NextResponse(
        `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px">
        <h2>⚠️ No refresh token returned</h2>
        <p>Google only sends the refresh token on the first authorisation. To reset:</p>
        <ol>
          <li>Go to <a href="https://myaccount.google.com/permissions">Google Account Permissions</a></li>
          <li>Revoke access for your app</li>
          <li><a href="/api/auth/google">Try again</a></li>
        </ol></body></html>`,
        { headers: { 'Content-Type': 'text/html' } },
      );
    }

    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:monospace;padding:40px;max-width:800px">
      <h2>✅ Google connected!</h2>
      <p>Add this as <code>GOOGLE_REFRESH_TOKEN</code> in your Vercel environment variables:</p>
      <div style="background:#f0f0f0;padding:16px;border-radius:8px;word-break:break-all;margin:16px 0;font-size:13px">
        ${refreshToken}
      </div>
      <p>Then redeploy your app and the daily briefing will be live.</p>
      <p><a href="/setup">← Back to Setup</a></p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } },
    );
  } catch (err) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:40px"><h2>Error</h2><pre>${String(err)}</pre><a href="/setup">← Back</a></body></html>`,
      { headers: { 'Content-Type': 'text/html' }, status: 500 },
    );
  }
}
