import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getApiUrl, getEndpoint } from '@/lib/config';

// 获取用户资料
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    // 从数据库获取用户资料
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        lifePlans: {
          orderBy: { year: 'asc' },
        },
        knowledgeFrameworks: {
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            lifePlans: true,
            knowledgeFrameworks: true,
            notes: true,
            matchesAsUser1: true,
            matchesAsUser2: true,
          },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { code: 404, message: '用户资料不存在' },
        { status: 404 }
      );
    }

    // 从SecondMe API获取用户信息
    const userInfoUrl = getApiUrl(getEndpoint('user', 'info'));
    const secondmeResponse = await fetch(
      userInfoUrl,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    let secondmeInfo = null;
    if (secondmeResponse.ok) {
      const result = await secondmeResponse.json();
      if (result.code === 0) {
        secondmeInfo = result.data;
      }
    }

    return NextResponse.json({
      code: 0,
      data: {
        user: {
          id: dbUser.id,
          secondmeUserId: dbUser.secondmeUserId,
          name: dbUser.name,
          avatar: dbUser.avatar,
          email: dbUser.email,
          bio: dbUser.bio,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        },
        lifePlans: dbUser.lifePlans,
        knowledgeFrameworks: dbUser.knowledgeFrameworks,
        notes: dbUser.notes,
        counts: dbUser._count,
        secondmeInfo,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { code: 500, message: '获取用户资料失败' },
      { status: 500 }
    );
  }
}

// 更新用户资料
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, avatar, bio } = body;

    // 更新用户资料
    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        name,
        avatar,
        bio,
      },
    });

    return NextResponse.json({
      code: 0,
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          avatar: updatedUser.avatar,
          bio: updatedUser.bio,
          email: updatedUser.email,
          updatedAt: updatedUser.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { code: 500, message: '更新用户资料失败' },
      { status: 500 }
    );
  }
}