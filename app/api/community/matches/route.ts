import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// 匹配算法：基于人生规划类别相似度计算匹配分数
function calculateMatchScore(currentUserPlans: any[], otherUserPlans: any[]): { score: number; reason: string } {
  // 提取类别
  const currentCategories = currentUserPlans.map(p => p.category);
  const otherCategories = otherUserPlans.map(p => p.category);

  // 计算共同类别
  const commonCategories = currentCategories.filter(cat => otherCategories.includes(cat));
  const uniqueCategories = Array.from(new Set([...currentCategories, ...otherCategories]));

  // 基础分数：共同类别比例
  const categoryScore = uniqueCategories.length > 0 ? (commonCategories.length / uniqueCategories.length) * 70 : 0;

  // 随机添加一些变化（模拟其他因素）
  const randomFactor = Math.random() * 30;
  const totalScore = Math.min(100, Math.round(categoryScore + randomFactor));

  // 生成匹配原因
  const reasons = [
    '人生规划目标相似',
    '职业发展方向一致',
    '学习成长路径相近',
    '创业梦想契合',
    '个人发展理念相通',
  ];

  const reason = commonCategories.length > 0
    ? `在${commonCategories.join('、')}领域有共同目标`
    : reasons[Math.floor(Math.random() * reasons.length)];

  return { score: totalScore, reason };
}

// 从用户bio中提取标签（简单实现）
function extractTagsFromBio(bio: string | null): string[] {
  if (!bio) return [];
  // 简单提取：以逗号、顿号分割，或从描述中提取关键词
  const parts = bio.split(/[,，、]/);
  return parts.slice(0, 3).map(p => p.trim()).filter(p => p.length > 0);
}

export async function GET(request: Request) {
  try {
    let currentUser = await getCurrentUser();
    let currentUserId = currentUser?.userId;

    // 开发环境：如果没有登录用户，使用模拟用户进行测试
    if (!currentUserId && process.env.NODE_ENV !== 'production') {
      console.log('开发模式：使用模拟用户进行匹配测试');
      // 使用第一个模拟用户作为当前用户
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        currentUserId = firstUser.id;
      } else {
        // 如果没有用户，返回空列表
        return NextResponse.json({
          code: 0,
          data: {
            matches: [],
            total: 0,
            filter: 'all',
            pagination: { limit: 20, offset: 0, hasMore: false },
          },
        });
      }
    }

    if (!currentUserId) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    // 从查询参数获取筛选条件
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 获取当前用户的人生规划
    const currentUserPlans = await prisma.lifePlan.findMany({
      where: { userId: currentUserId },
      select: { category: true, year: true, title: true }
    });

    // 获取其他用户（排除当前用户）
    const otherUsers = await prisma.user.findMany({
      where: {
        id: { not: currentUserId }
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        email: true,
        lifePlans: {
          select: { category: true, year: true, title: true }
        }
      }
    });

    // 计算匹配结果
    const matches = await Promise.all(otherUsers.map(async (user: any) => {
      const { score, reason } = calculateMatchScore(currentUserPlans, user.lifePlans);
      const tags = extractTagsFromBio(user.bio);

      // 提取人生规划用于展示
      const lifePlans = user.lifePlans.slice(0, 2).map((plan: any) => ({
        year: plan.year,
        title: plan.title
      }));

      // 如果没有人生规划，添加默认展示
      if (lifePlans.length === 0) {
        lifePlans.push(
          { year: 1, title: '探索人生方向' },
          { year: 5, title: '实现个人成长' }
        );
      }

      return {
        id: user.id,
        name: user.name || '匿名用户',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
        bio: user.bio || '暂无个人介绍',
        matchScore: score,
        matchReason: reason,
        tags: tags.length > 0 ? tags : ['个人成长', '人生设计'],
        lifePlans
      };
    }));

    // 根据筛选条件过滤
    let filteredMatches = matches;
    if (filter === 'high') {
      filteredMatches = matches.filter((m: any) => m.matchScore >= 85);
    } else if (filter === 'medium') {
      filteredMatches = matches.filter((m: any) => m.matchScore >= 70 && m.matchScore < 85);
    } else if (filter === 'low') {
      filteredMatches = matches.filter((m: any) => m.matchScore < 70);
    }

    // 根据匹配分数排序（降序）
    filteredMatches.sort((a: any, b: any) => b.matchScore - a.matchScore);

    // 应用分页
    const paginatedMatches = filteredMatches.slice(offset, offset + limit);

    return NextResponse.json({
      code: 0,
      data: {
        matches: paginatedMatches,
        total: filteredMatches.length,
        filter,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < filteredMatches.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { code: 500, message: '获取匹配用户失败' },
      { status: 500 }
    );
  }
}