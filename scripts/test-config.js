#!/usr/bin/env node
/**
 * 配置验证脚本
 * 运行：node scripts/test-config.js
 */

// 模拟环境变量用于测试
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// 动态导入 TypeScript 模块（需要 ts-node 或先编译）
try {
  // 尝试加载编译后的版本
  const config = require('../lib/config');

  console.log('🔧 配置验证脚本');
  console.log('================');

  // 获取环境信息
  const envInfo = config.getEnvironmentInfo();
  console.log('环境信息:');
  console.log('- NODE_ENV:', envInfo.nodeEnv);
  console.log('- 生产环境:', envInfo.isProduction);
  console.log('- 开发环境:', envInfo.isDevelopment);
  console.log('- VERCEL_URL:', envInfo.vercelUrl || '未设置');
  console.log('- 数据库URL配置:', envInfo.hasDatabaseUrl ? '是' : '否');
  console.log('- SecondMe配置:', envInfo.hasSecondMeConfig ? '是' : '否');

  // 获取OAuth配置（隐藏敏感信息）
  const oauthConfig = config.getOAuthConfig();
  console.log('\nOAuth配置:');
  console.log('- Client ID:', oauthConfig.clientId ? `${oauthConfig.clientId.substring(0, 8)}...` : '未设置');
  console.log('- Client Secret:', oauthConfig.clientSecret ? '***' : '未设置');
  console.log('- Redirect URI:', oauthConfig.redirectUri);
  console.log('- Authorize URL:', oauthConfig.authorizeUrl);

  // 验证配置
  console.log('\n配置验证:');
  try {
    config.validateProductionConfig();
    console.log('✅ 配置验证通过');
  } catch (error) {
    console.log('❌ 配置验证失败:', error.message);
  }

  console.log('\n💡 建议:');
  if (envInfo.isDevelopment) {
    console.log('- 本地开发环境，使用默认配置即可');
    console.log('- 确保数据库连接正常');
  } else {
    console.log('- 生产环境，请检查 SECONDME_REDIRECT_URI 是否为HTTPS地址');
    console.log('- 确保 DATABASE_URL 设置为生产环境数据库');
    console.log('- 验证 SecondMe OAuth 回调地址配置');
  }

} catch (error) {
  console.error('❌ 加载配置模块失败:', error.message);
  console.error('\n可能的原因:');
  console.error('1. 需要先编译 TypeScript: npm run build');
  console.error('2. 或使用 API 端点检查: http://localhost:3000/api/config/check');
  console.error('3. 或安装 ts-node: npm install -D ts-node');
  process.exit(1);
}