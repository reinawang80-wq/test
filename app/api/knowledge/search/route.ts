import { NextResponse } from 'next/server';
import { zhihuClient } from '@/lib/zhihu';
// import { getCurrentUser } from '@/lib/auth';

/**
 * 知识检索搜索API
 *
 * 这个端点提供知识检索功能，调用知乎开放平台的搜索接口
 * 用于在知识框架页面中搜索全网相关知识内容
 */

export async function GET(request: Request) {
  console.log('知乎搜索API被调用，URL:', request.url);
  try {
    // 暂时跳过用户登录验证，以便测试
    // console.log('验证用户登录状态...');
    // const user = await getCurrentUser();
    // console.log('用户登录状态:', user ? `已登录 (ID: ${user.id})` : '未登录');
    //
    // if (!user) {
    //   console.log('用户未登录，返回401');
    //   return NextResponse.json(
    //     { code: 401, message: '未登录' },
    //     { status: 401 }
    //   );
    // }
    // console.log('用户已登录，继续处理');

    // 检查知乎API配置
    console.log('检查知乎API配置...');
    const isConfigured = zhihuClient.isConfigured();
    console.log('知乎API配置状态:', isConfigured);

    if (!isConfigured) {
      console.log('知乎API配置不完整，返回错误');
      return NextResponse.json({
        code: 400,
        message: '知识检索功能暂不可用，请配置知乎API密钥',
        data: {
          configured: false,
          hint: '请设置ZHI_HU_APP_KEY和ZHI_HU_APP_SECRET环境变量，联系知乎@王佳蕴申请密钥',
          env: {
            ZHI_HU_API_BASE_URL: process.env.ZHI_HU_API_BASE_URL,
            ZHI_HU_APP_KEY: process.env.ZHI_HU_APP_KEY ? '***' + process.env.ZHI_HU_APP_KEY.slice(-4) : '(空)',
            ZHI_HU_APP_SECRET: process.env.ZHI_HU_APP_SECRET ? '***' + process.env.ZHI_HU_APP_SECRET.slice(-4) : '(空)'
          }
        }
      });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const count = searchParams.get('count');

    console.log('查询参数: query=', query, 'count=', count);

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { code: 400, message: '搜索关键词不能为空' },
        { status: 400 }
      );
    }

    // 调用知乎搜索API
    console.log('调用知乎搜索API...');
    const searchResult = await zhihuClient.search({
      query: query.trim(),
      count: count ? parseInt(count, 10) : 10
    });

    console.log('知乎API响应状态:', searchResult.status, '消息:', searchResult.msg);

    // 处理搜索结果
    if (searchResult.status === 0 && searchResult.data) {
      // 转换格式为前端友好的格式
      const transformedItems = searchResult.data.items.map(item => ({
        id: item.content_id,
        title: item.title,
        content: item.content_text,
        type: item.content_type,
        url: item.url,
        author: {
          name: item.author_name,
          avatar: item.author_avatar,
          badge: item.author_badge,
          badgeText: item.author_badge_text,
          authorityLevel: item.authority_level
        },
        stats: {
          commentCount: item.comment_count,
          voteUpCount: item.vote_up_count
        },
        editTime: item.edit_time,
        comments: item.comment_info_list?.map(comment => comment.content) || [],
        source: 'zhihu'
      }));

      console.log('成功转换', transformedItems.length, '个结果');

      return NextResponse.json({
        code: 0,
        data: {
          items: transformedItems,
          hasMore: searchResult.data.has_more,
          total: transformedItems.length,
          query: query.trim(),
          source: '知乎开放平台'
        },
        message: '搜索成功'
      });
    } else {
      // 知乎API返回错误
      console.log('知乎API返回错误:', searchResult.msg);
      return NextResponse.json({
        code: 500,
        message: `搜索失败: ${searchResult.msg}`,
        data: null
      });
    }

  } catch (error) {
    console.error('知识检索搜索API错误:', error);

    return NextResponse.json({
      code: 500,
      message: '搜索服务暂时不可用，请稍后重试',
      data: null
    });
  }
}