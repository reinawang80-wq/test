import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();

  // 清除认证cookie
  cookieStore.delete('user_id');
  cookieStore.delete('access_token');

  return NextResponse.json({ code: 0, message: '退出成功' });
}