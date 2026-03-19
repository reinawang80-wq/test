import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getApiUrl, getEndpoint } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const { text, action_type } = await request.json();

    // 调用SecondMe动作判断API
    const actUrl = getApiUrl(getEndpoint('act', 'judge'));
    const response = await fetch(
      actUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          text,
          action_type,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to call SecondMe act API');
    }

    const result = await response.json();

    return NextResponse.json({
      code: 0,
      data: result.data,
    });
  } catch (error) {
    console.error('Act API error:', error);
    return NextResponse.json(
      { code: 500, message: '动作判断失败' },
      { status: 500 }
    );
  }
}