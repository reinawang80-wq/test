#!/usr/bin/env node

// 测试知乎API配置
require('dotenv').config({ path: '.env.local' });

const { ZhihuClient } = require('./lib/zhihu');

async function testZhihuAPI() {
  console.log('测试知乎API配置...');
  console.log('ZHI_HU_API_BASE_URL:', process.env.ZHI_HU_API_BASE_URL);
  console.log('ZHI_HU_APP_KEY:', process.env.ZHI_HU_APP_KEY ? '***' + process.env.ZHI_HU_APP_KEY.slice(-4) : '未设置');
  console.log('ZHI_HU_APP_SECRET:', process.env.ZHI_HU_APP_SECRET ? '***' + process.env.ZHI_HU_APP_SECRET.slice(-4) : '未设置');

  const client = new ZhihuClient();

  console.log('\n客户端配置检查:');
  console.log('isConfigured():', client.isConfigured());

  if (!client.isConfigured()) {
    console.error('知乎API配置不完整！');
    process.exit(1);
  }

  console.log('\n测试搜索API...');
  try {
    const result = await client.search({ query: '学习方法', count: 2 });

    console.log('API响应状态:', result.status);
    console.log('API响应消息:', result.msg);

    if (result.status === 0 && result.data) {
      console.log(`找到 ${result.data.items.length} 个结果`);
      if (result.data.items.length > 0) {
        const first = result.data.items[0];
        console.log('第一个结果:');
        console.log('  标题:', first.title);
        console.log('  类型:', first.content_type);
        console.log('  作者:', first.author_name);
        console.log('  赞同数:', first.vote_up_count);
      }
    } else {
      console.error('API调用失败:', result.msg);
    }
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

testZhihuAPI();