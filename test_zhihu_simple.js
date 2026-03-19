#!/usr/bin/env node

// 简单测试知乎API配置
require('dotenv').config({ path: '.env.local' });

console.log('环境变量检查:');
console.log('ZHI_HU_API_BASE_URL:', process.env.ZHI_HU_API_BASE_URL);
console.log('ZHI_HU_APP_KEY:', process.env.ZHI_HU_APP_KEY);
console.log('ZHI_HU_APP_SECRET:', process.env.ZHI_HU_APP_SECRET ? '***' + process.env.ZHI_HU_APP_SECRET.slice(-4) : '未设置');

const appKey = process.env.ZHI_HU_APP_KEY;
const appSecret = process.env.ZHI_HU_APP_SECRET;

if (!appKey || !appSecret) {
  console.error('错误: 缺少知乎API配置');
  process.exit(1);
}

console.log('\n配置检查通过!');

// 测试签名生成
const crypto = require('crypto');
function generateSignature(timestamp, logId, extraInfo = '') {
  const signString = `app_key:${appKey}|ts:${timestamp}|logid:${logId}|extra_info:${extraInfo}`;
  const hmac = crypto.createHmac('sha256', appSecret);
  hmac.update(signString);
  return hmac.digest('base64');
}

const timestamp = Math.floor(Date.now() / 1000).toString();
const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const signature = generateSignature(timestamp, logId, '');

console.log('\n签名生成测试:');
console.log('Timestamp:', timestamp);
console.log('Log ID:', logId);
console.log('Signature (前20字符):', signature.substring(0, 20) + '...');
console.log('Signature length:', signature.length);

console.log('\n请求头示例:');
console.log('X-App-Key:', appKey);
console.log('X-Timestamp:', timestamp);
console.log('X-Log-Id:', logId);
console.log('X-Sign:', signature.substring(0, 20) + '...');