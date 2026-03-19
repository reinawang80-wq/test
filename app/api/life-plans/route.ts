import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// 获取当前用户的人生规划
export async function GET() {
  try {
    let currentUser = await getCurrentUser();
    let currentUserId = currentUser?.userId;

    // 开发环境：如果没有登录用户，使用模拟用户进行测试
    if (!currentUserId && process.env.NODE_ENV !== 'production') {
      console.log('开发模式：使用模拟用户获取人生规划');
      // 使用第一个模拟用户作为当前用户
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        currentUserId = firstUser.id;
      } else {
        // 如果没有用户，返回空列表
        return NextResponse.json({
          code: 0,
          data: []
        });
      }
    }

    if (!currentUserId) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const plans = await prisma.lifePlan.findMany({
      where: { userId: currentUserId },
      orderBy: { year: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        year: true,
        category: true,
        goals: true,
        milestones: true,
        progress: true,
        isPublic: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      code: 0,
      data: plans
    });
  } catch (error) {
    console.error('获取人生规划失败:', error);
    return NextResponse.json(
      { code: 500, message: '获取人生规划失败' },
      { status: 500 }
    );
  }
}

// 创建新的人生规划
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 验证必要字段
    if (!body.title || !body.year || !body.category) {
      return NextResponse.json(
        { code: 400, message: '缺少必要字段: title, year, category' },
        { status: 400 }
      );
    }

    // 创建规划
    const plan = await prisma.lifePlan.create({
      data: {
        userId: user.userId,
        title: body.title,
        description: body.description || '',
        year: parseInt(body.year),
        category: body.category,
        goals: body.goals || [],
        milestones: body.milestones || [],
        progress: body.progress || 0,
        isPublic: body.isPublic || false,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : new Date(Date.now() + body.year * 365 * 24 * 60 * 60 * 1000), // 默认 year 年后
      },
      select: {
        id: true,
        title: true,
        description: true,
        year: true,
        category: true,
        goals: true,
        milestones: true,
        progress: true,
        isPublic: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      code: 0,
      data: plan,
      message: '人生规划创建成功'
    }, { status: 201 });
  } catch (error) {
    console.error('创建人生规划失败:', error);
    return NextResponse.json(
      { code: 500, message: '创建人生规划失败' },
      { status: 500 }
    );
  }
}