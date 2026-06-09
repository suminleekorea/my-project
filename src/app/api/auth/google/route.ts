import { NextResponse } from 'next/server';
import { getOAuthClient, getAuthUrl } from '@/lib/google-auth';

export const dynamic = 'force-dynamic';

export function GET() {
  const client = getOAuthClient();
  const url = getAuthUrl(client);
  return NextResponse.redirect(url);
}
