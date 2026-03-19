#!/usr/bin/env node

// 直接测试知乎API
require('dotenv').config({ path: '.env.local' });

const crypto = require('crypto');

const BASE_URL = process.env.ZHI_HU_API_BASE_URL || 'https://openapi.zhihu.com';
const APP_KEY = process.env.ZHI_HU_APP_KEY;
const APP_SECRET = process.env.ZHI_HU_APP_SECRET;

if (!APP_KEY || !APP_SECRET) {
  console.error('错误: 缺少知乎API配置');
  process.exit(1);
}

function generateSignature(timestamp, logId, extraInfo = '') {
  const signString = `app_key:${APP_KEY}|ts:${timestamp}|logid:${logId}|extra_info:${extraInfo}`;
  const hmac = crypto.createHmac('sha256', APP_SECRET);
  hmac.update(signString);
  return hmac.digest('base64');
}

async function testSearch() {
  const query = '学习方法';
  const count = 2;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const signature = generateSignature(timestamp, logId, '');

  const headers = {
    'X-App-Key': APP_KEY,
    'X-Timestamp': timestamp,
    'X-Log-Id': logId,
    'X-Sign': signature,
    'X-Extra-Info': '',
    'Content-Type': 'application/json'
  };

  const encodedQuery = encodeURIComponent(query);
  const url = `${BASE_URL}/openapi/search/global?query=${encodedQuery}&count=${count}`;

  console.log('测试知乎搜索API...');
  console.log('URL:', url);
  console.log('Headers:', {
    'X-App-Key': APP_KEY,
    'X-Timestamp': timestamp,
    'X-Log-Id': logId,
    'X-Sign': signature.substring(0, 20) + '...',
    'X-Extra-Info': '',
  });

  try {
    const response = await fetch(url, { headers });

    console.log('\n响应状态:', response.status, response.statusText);

    const text = await response.text();
    console.log('响应体长度:', text.length);

    try {
      const data = JSON.parse(text);
      console.log('解析后的响应:', JSON.stringify(data, null, 2).substring(0, 500) + '...');

      if (data.status === 0 && data.data) {
        console.log(`\n成功! 找到 ${data.data.items.length} 个结果`);
      } else {
        console.error('API返回错误:', data.msg);
      }
    } catch (e) {
      console.log('响应体(原始):', text.substring(0, 500));
    }

  } catch (error) {
    console.error('请求失败:', error);
  }
}

testSearch();