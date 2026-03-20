import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getApiUrl, getEndpoint } from '@/lib/config';
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
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {
      userId: user.userId,
    };

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    // 获取笔记列表和总数
    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          content: true,
          type: true,
          tags: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.note.count({ where }),
    ]);

    // 解析JSON tags
    const notesWithParsedTags = notes.map((note: any) => ({
      ...note,
      tags: note.tags ? JSON.parse(note.tags as string) : [],
    }));

    return NextResponse.json({
      code: 0,
      data: {
        notes: notesWithParsedTags,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      message: '获取笔记列表成功',
    });
  } catch (error) {
    console.error('Get notes error:', error);
    return NextResponse.json(
      { code: 500, message: '获取笔记失败' },
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

    const { title, content, type = '规划记录', tags = [], isPublic = false } = await request.json();

    // 在本地数据库创建笔记
    const note = await prisma.note.create({
      data: {
        userId: user.userId,
        title,
        content,
        type,
        tags: JSON.stringify(tags),
        isPublic,
      },
    });

    // 同步到SecondMe（如果有权限）
    try {
      const endpoint = getEndpoint('note', 'add');
      const apiUrl = getApiUrl(endpoint);

      const secondMeResponse = await fetch(
        apiUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({
            title,
            content,
            tags,
          }),
        }
      );

      if (!secondMeResponse.ok) {
        console.warn('Failed to sync note to SecondMe, but local note saved');
      }
    } catch (syncError) {
      console.warn('SecondMe sync error:', syncError);
      // 继续，不阻塞用户
    }

    return NextResponse.json({
      code: 0,
      data: note,
      message: '笔记创建成功',
    });
  } catch (error) {
    console.error('Note creation error:', error);
    return NextResponse.json(
      { code: 500, message: '笔记创建失败' },
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

    const { id, title, content, type, tags, isPublic } = await request.json();

    if (!id) {
      return NextResponse.json(
        { code: 400, message: '笔记ID不能为空' },
        { status: 400 }
      );
    }

    // 检查笔记是否存在且属于当前用户
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!existingNote) {
      return NextResponse.json(
        { code: 404, message: '笔记不存在或无权访问' },
        { status: 404 }
      );
    }

    // 构建更新数据
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    // 更新笔记
    const updatedNote = await prisma.note.update({
      where: { id },
      data: updateData,
    });

    // 同步到SecondMe（如果有权限）
    try {
      const endpoint = getEndpoint('note', 'update');
      const apiUrl = getApiUrl(endpoint);

      const secondMeResponse = await fetch(
        apiUrl,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({
            id,
            title,
            content,
            tags,
          }),
        }
      );

      if (!secondMeResponse.ok) {
        console.warn('Failed to sync note update to SecondMe, but local note updated');
      }
    } catch (syncError) {
      console.warn('SecondMe sync error:', syncError);
      // 继续，不阻塞用户
    }

    return NextResponse.json({
      code: 0,
      data: updatedNote,
      message: '笔记更新成功',
    });
  } catch (error) {
    console.error('Note update error:', error);
    return NextResponse.json(
      { code: 500, message: '笔记更新失败' },
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
        { code: 400, message: '笔记ID不能为空' },
        { status: 400 }
      );
    }

    // 检查笔记是否存在且属于当前用户
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!existingNote) {
      return NextResponse.json(
        { code: 404, message: '笔记不存在或无权访问' },
        { status: 404 }
      );
    }

    // 删除笔记
    await prisma.note.delete({
      where: { id },
    });

    // 同步到SecondMe（如果有权限）
    try {
      const endpoint = getEndpoint('note', 'delete');
      const apiUrl = getApiUrl(endpoint);

      const secondMeResponse = await fetch(
        apiUrl,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({ id }),
        }
      );

      if (!secondMeResponse.ok) {
        console.warn('Failed to sync note deletion to SecondMe, but local note deleted');
      }
    } catch (syncError) {
      console.warn('SecondMe sync error:', syncError);
      // 继续，不阻塞用户
    }

    return NextResponse.json({
      code: 0,
      message: '笔记删除成功',
    });
  } catch (error) {
    console.error('Note deletion error:', error);
    return NextResponse.json(
      { code: 500, message: '笔记删除失败' },
      { status: 500 }
    );
  }
}