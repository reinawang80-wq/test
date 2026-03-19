import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// 获取单个知识框架详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { code: 400, message: '知识框架ID不能为空' },
        { status: 400 }
      );
    }

    // 构建查询条件：用户自己的或公开的
    const where: any = {
      id,
      OR: [
        { userId: user?.userId }, // 如果用户已登录，可以访问自己的
        { isPublic: true },       // 公开的框架
      ],
    };

    // 如果用户未登录，只能访问公开的
    if (!user) {
      where.isPublic = true;
    }

    const framework = await prisma.knowledgeFramework.findFirst({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        content: true,
        tags: true,
        isPublic: true,
        viewCount: true,
        likeCount: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!framework) {
      return NextResponse.json(
        { code: 404, message: '知识框架不存在或无权访问' },
        { status: 404 }
      );
    }

    // 增加浏览次数（仅当用户已登录且不是创建者时）
    if (user && framework.user.id !== user.userId) {
      await prisma.knowledgeFramework.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
      framework.viewCount += 1;
    }

    // 解析JSON字段
    const frameworkWithParsedData = {
      ...framework,
      content: framework.content ? JSON.parse(framework.content as string) : null,
      tags: framework.tags ? JSON.parse(framework.tags as string) : [],
    };

    return NextResponse.json({
      code: 0,
      data: frameworkWithParsedData,
      message: '获取知识框架详情成功',
    });
  } catch (error) {
    console.error('Get knowledge framework detail error:', error);
    return NextResponse.json(
      { code: 500, message: '获取知识框架详情失败' },
      { status: 500 }
    );
  }
}

// 更新知识框架
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { title, description, category, content, tags, isPublic } = await request.json();

    if (!id) {
      return NextResponse.json(
        { code: 400, message: '知识框架ID不能为空' },
        { status: 400 }
      );
    }

    // 检查知识框架是否存在且属于当前用户
    const existingFramework = await prisma.knowledgeFramework.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!existingFramework) {
      return NextResponse.json(
        { code: 404, message: '知识框架不存在或无权编辑' },
        { status: 404 }
      );
    }

    // 构建更新数据
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (content !== undefined) updateData.content = JSON.stringify(content);
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    // 更新知识框架
    const updatedFramework = await prisma.knowledgeFramework.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      code: 0,
      data: {
        ...updatedFramework,
        content: content !== undefined ? content : JSON.parse(existingFramework.content as string),
        tags: tags !== undefined ? tags : JSON.parse(existingFramework.tags as string),
      },
      message: '知识框架更新成功',
    });
  } catch (error) {
    console.error('Update knowledge framework error:', error);
    return NextResponse.json(
      { code: 500, message: '更新知识框架失败' },
      { status: 500 }
    );
  }
}

// 删除知识框架
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { code: 400, message: '知识框架ID不能为空' },
        { status: 400 }
      );
    }

    // 检查知识框架是否存在且属于当前用户
    const existingFramework = await prisma.knowledgeFramework.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!existingFramework) {
      return NextResponse.json(
        { code: 404, message: '知识框架不存在或无权删除' },
        { status: 404 }
      );
    }

    // 删除知识框架
    await prisma.knowledgeFramework.delete({
      where: { id },
    });

    return NextResponse.json({
      code: 0,
      message: '知识框架删除成功',
    });
  } catch (error) {
    console.error('Delete knowledge framework error:', error);
    return NextResponse.json(
      { code: 500, message: '删除知识框架失败' },
      { status: 500 }
    );
  }
}

// 点赞知识框架
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { action } = await request.json(); // 'like' or 'unlike'

    if (!id) {
      return NextResponse.json(
        { code: 400, message: '知识框架ID不能为空' },
        { status: 400 }
      );
    }

    // 检查知识框架是否存在
    const existingFramework = await prisma.knowledgeFramework.findFirst({
      where: {
        id,
        OR: [
          { userId: user.userId }, // 用户自己的
          { isPublic: true },      // 公开的
        ],
      },
    });

    if (!existingFramework) {
      return NextResponse.json(
        { code: 404, message: '知识框架不存在或无权访问' },
        { status: 404 }
      );
    }

    // 更新点赞数
    const increment = action === 'like' ? 1 : -1;
    const updatedFramework = await prisma.knowledgeFramework.update({
      where: { id },
      data: {
        likeCount: { increment },
      },
    });

    return NextResponse.json({
      code: 0,
      data: {
        likeCount: updatedFramework.likeCount,
      },
      message: action === 'like' ? '点赞成功' : '取消点赞成功',
    });
  } catch (error) {
    console.error('Like knowledge framework error:', error);
    return NextResponse.json(
      { code: 500, message: '操作失败' },
      { status: 500 }
    );
  }
}