import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
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

    // 从SecondMe API获取用户信息
    const endpoint = getEndpoint('user', 'info');
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
      console.error('SecondMe API response not ok:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Failed to fetch user info from SecondMe');
    }

    const result = await response.json();
    console.log('SecondMe API response:', JSON.stringify(result).substring(0, 500));

    if (result.code !== 0) {
      console.error('SecondMe API business error:', result);
      throw new Error('SecondMe API error: ' + result.message);
    }

    // 获取本地数据库中的用户信息
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        lifePlans: {
          orderBy: { year: 'asc' },
          take: 10,
        },
        knowledgeFrameworks: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            lifePlans: true,
            knowledgeFrameworks: true,
            notes: true,
          },
        },
      },
    });

    return NextResponse.json({
      code: 0,
      data: {
        secondmeInfo: result.data,
        localInfo: dbUser,
      },
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return NextResponse.json(
      { code: 500, message: '获取用户信息失败' },
      { status: 500 }
    );
  }
}