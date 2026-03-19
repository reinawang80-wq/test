import { getCurrentUser } from '@/lib/auth';
import { getApiUrl, getEndpoint } from '@/lib/config';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    // 从SecondMe API获取用户兴趣标签
    const endpoint = getEndpoint('user', 'shades');
    const apiUrl = getApiUrl(endpoint);

    const response = await fetch(
      apiUrl,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user shades from SecondMe');
    }

    const result = await response.json();

    if (result.code !== 0) {
      throw new Error('SecondMe API error: ' + result.message);
    }

    return NextResponse.json({
      code: 0,
      data: result.data,
    });
  } catch (error) {
    console.error('Error fetching user shades:', error);
    return NextResponse.json(
      { code: 500, message: '获取用户兴趣标签失败' },
      { status: 500 }
    );
  }
}