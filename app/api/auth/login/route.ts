import { generateState, getOAuthUrl } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const state = generateState();

  // 保存state到cookie
  const cookieStore = await cookies();
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10, // 10分钟
    path: '/',
  });

  const authUrl = getOAuthUrl(state);

  return NextResponse.redirect(authUrl);
}