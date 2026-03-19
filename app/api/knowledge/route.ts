import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isPublic = searchParams.get('isPublic');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {
      OR: [
        { userId: user.userId }, // 用户自己的框架
        { isPublic: true },      // 公开的框架
      ],
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (isPublic === 'true') {
      where.isPublic = true;
    } else if (isPublic === 'false') {
      where.isPublic = false;
      where.userId = user.userId; // 只显示用户自己的私有框架
    }

    // 获取知识框架列表和总数
    const [frameworks, total] = await Promise.all([
      prisma.knowledgeFramework.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
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
      }),
      prisma.knowledgeFramework.count({ where }),
    ]);

    // 解析JSON字段
    const frameworksWithParsedData = frameworks.map(framework => ({
      ...framework,
      content: framework.content ? JSON.parse(framework.content as string) : null,
      tags: framework.tags ? JSON.parse(framework.tags as string) : [],
    }));

    return NextResponse.json({
      code: 0,
      data: {
        frameworks: frameworksWithParsedData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      message: '获取知识框架成功',
    });
  } catch (error) {
    console.error('Get knowledge frameworks error:', error);
    return NextResponse.json(
      { code: 500, message: '获取知识框架失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const { title, description, category, content, tags = [], isPublic = false } = await request.json();

    if (!title || !category) {
      return NextResponse.json(
        { code: 400, message: '标题和分类不能为空' },
        { status: 400 }
      );
    }

    // 在本地数据库创建知识框架
    const framework = await prisma.knowledgeFramework.create({
      data: {
        userId: user.userId,
        title,
        description,
        category,
        content: JSON.stringify(content || {}),
        tags: JSON.stringify(tags),
        isPublic,
      },
    });

    return NextResponse.json({
      code: 0,
      data: {
        ...framework,
        content: content || {},
        tags,
      },
      message: '知识框架创建成功',
    });
  } catch (error) {
    console.error('Create knowledge framework error:', error);
    return NextResponse.json(
      { code: 500, message: '创建知识框架失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const { id, title, description, category, content, tags, isPublic } = await request.json();

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
        { code: 404, message: '知识框架不存在或无权访问' },
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

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

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
        { code: 404, message: '知识框架不存在或无权访问' },
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