import { getCurrentUser } from '@/lib/auth';
import { getApiUrl, getEndpoint } from '@/lib/config';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { code: 401, message: '未登录' },
        { status: 401 }
      );
    }

    const { messages, session_id } = await request.json();

    // 调用SecondMe聊天API
    const endpoint = getEndpoint('chat', 'send');
    const apiUrl = getApiUrl(endpoint);

    const response = await fetch(
      apiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          messages,
          session_id,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      console.warn('SecondMe chat API failed, falling back to mock response');
      // 创建模拟流式响应
      const encoder = new TextEncoder();
      const mockText = '你好！我是SecondMe聊天助手。目前聊天服务正在升级中，暂时无法提供实时对话。你可以尝试以下功能：\n1. 查看你的个人资料和兴趣标签\n2. 使用笔记功能记录想法\n3. 探索社区匹配功能\n\n我们会尽快恢复服务！';
      const stream = new ReadableStream({
        async start(controller) {
          // 模拟流式输出（分块发送）
          const chunks = mockText.match(/.{1,10}/g) || [mockText];
          for (const chunk of chunks) {
            await new Promise(resolve => setTimeout(resolve, 30));
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            controller.enqueue(value);
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { code: 500, message: '聊天请求失败' },
      { status: 500 }
    );
  }
}