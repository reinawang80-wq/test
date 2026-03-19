import { zhihuClient } from '@/lib/zhihu';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 检查知乎客户端是否配置
    if (!zhihuClient.isConfigured()) {
      return NextResponse.json({
        code: 500,
        message: '知乎API配置不完整，请设置ZHI_HU_APP_KEY和ZHI_HU_APP_SECRET环境变量',
        data: null
      }, { status: 500 });
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const count = searchParams.get('count') || '10';

    if (!query || query.trim() === '') {
      return NextResponse.json({
        code: 400,
        message: '搜索关键词不能为空',
        data: null
      }, { status: 400 });
    }

    // 调用知乎搜索API
    const result = await zhihuClient.search({
      query: query.trim(),
      count: parseInt(count, 10)
    });

    // 知乎API返回格式适配
    if (result.status !== 0) {
      return NextResponse.json({
        code: 500,
        message: `知乎搜索失败: ${result.msg}`,
        data: null
      }, { status: 500 });
    }

    // 转换结果为前端需要的格式
    const formattedResults = result.data?.items.map(item => {
      // 根据内容类型显示不同的源标识
      let source: '知乎' | '收藏' = '知乎';
      if (item.content_type === 'Answer') {
        source = '知乎';
      } else if (item.content_type === 'Article') {
        source = '知乎';
      } else if (item.content_type === 'Question') {
        source = '知乎';
      }

      return {
        id: item.content_id,
        title: item.title,
        content: item.content_text || item.title,
        source,
        author: item.author_name,
        createdAt: new Date(item.edit_time * 1000).toISOString().split('T')[0], // 转为YYYY-MM-DD格式
        tags: item.author_badge ? [item.author_badge] : [],
        metadata: {
          contentType: item.content_type,
          url: item.url,
          voteUpCount: item.vote_up_count,
          commentCount: item.comment_count,
          authorityLevel: item.authority_level
        }
      };
    }) || [];

    return NextResponse.json({
      code: 0,
      data: {
        results: formattedResults,
        total: result.data?.items.length || 0,
        hasMore: result.data?.has_more || false,
        query: query.trim()
      },
      message: '搜索成功'
    });

  } catch (error) {
    console.error('知乎搜索API错误:', error);
    return NextResponse.json({
      code: 500,
      message: error instanceof Error ? error.message : '搜索失败',
      data: null
    }, { status: 500 });
  }
}