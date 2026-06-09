import { google } from 'googleapis';
import type { GAuthClient } from './google-auth';
import type { EmailThread } from './types';

function decodeBase64Url(encoded: string): string {
  return Buffer.from(encoded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractBody(payload: any): string {
  if (!payload) return '';
  if (payload.body?.data) return decodeBase64Url(payload.body.data);
  if (Array.isArray(payload.parts)) {
    const plain = payload.parts.find((p: { mimeType?: string }) => p.mimeType === 'text/plain');
    if (plain?.body?.data) return decodeBase64Url(plain.body.data);
    for (const part of payload.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }
  }
  return '';
}

function header(headers: Array<{ name?: string | null; value?: string | null }>, name: string): string {
  return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? '';
}

export async function fetchRecentEmails(auth: GAuthClient, hoursBack = 48): Promise<EmailThread[]> {
  const gmail = google.gmail({ version: 'v1', auth: auth as Parameters<typeof google.gmail>[0]['auth'] });
  const after = Math.floor((Date.now() - hoursBack * 3_600_000) / 1000);

  try {
    const list = await gmail.users.messages.list({
      userId: 'me',
      q: `after:${after} -in:spam`,
      maxResults: 40,
    });

    const messages = list.data.messages ?? [];
    const results = await Promise.allSettled(
      messages.map((msg) =>
        gmail.users.messages.get({ userId: 'me', id: msg.id!, format: 'full' }),
      ),
    );

    return results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = (r as PromiseFulfilledResult<any>).value.data;
        const headers = d.payload?.headers ?? [];
        const labels: string[] = d.labelIds ?? [];
        return {
          id: d.id ?? '',
          subject: header(headers, 'Subject') || '(no subject)',
          from: header(headers, 'From'),
          date: header(headers, 'Date'),
          snippet: d.snippet ?? '',
          body: extractBody(d.payload).slice(0, 1500),
          isUnread: labels.includes('UNREAD'),
          isImportant: labels.includes('IMPORTANT'),
          labels,
        } satisfies EmailThread;
      });
  } catch (err) {
    console.error('[gmail] fetch error:', err);
    return [];
  }
}
