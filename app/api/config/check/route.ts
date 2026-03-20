import { validateProductionConfig, getEnvironmentInfo, getOAuthConfig } from '@/lib/config';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const environmentInfo = getEnvironmentInfo();
    const oauthConfig = getOAuthConfig();

    // 安全地处理敏感信息
    const safeOAuthConfig = {
      ...oauthConfig,
      clientId: oauthConfig.clientId ? `${oauthConfig.clientId.substring(0, 8)}...` : '未设置',
      clientSecret: oauthConfig.clientSecret ? '***' : '未设置',
      redirectUri: oauthConfig.redirectUri,
    };

    // 验证配置（只记录错误，不抛出）
    let validationErrors: string[] = [];
    try {
      validateProductionConfig(oauthConfig);
    } catch (error: any) {
      validationErrors = error.message.split(', ');
    }

    // 检查数据库连接
    let dbStatus = 'unknown';
    try {
      // 尝试导入Prisma但不实际查询，避免连接失败影响页面
      const { prisma } = await import('@/lib/db');
      // 简单查询验证连接
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error: any) {
      dbStatus = `error: ${error.message}`;
    }

    const configInfo = {
      timestamp: new Date().toISOString(),
      environment: environmentInfo,
      oauthConfig: safeOAuthConfig,
      validation: {
        hasErrors: validationErrors.length > 0,
        errors: validationErrors,
      },
      database: {
        status: dbStatus,
        urlConfigured: !!process.env.DATABASE_URL,
        urlPreview: process.env.DATABASE_URL ?
          process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@').substring(0, 80) + '...' : '未设置',
      },
      envVars: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
        VERCEL_ENV: process.env.VERCEL_ENV,
        // 列出其他关键环境变量（隐藏值）
        SECONDME_CLIENT_ID_SET: !!process.env.SECONDME_CLIENT_ID,
        SECONDME_CLIENT_SECRET_SET: !!process.env.SECONDME_CLIENT_SECRET,
        SECONDME_REDIRECT_URI_SET: !!process.env.SECONDME_REDIRECT_URI,
        SECONDME_REDIRECT_URI_PREVIEW: process.env.SECONDME_REDIRECT_URI ?
          process.env.SECONDME_REDIRECT_URI.substring(0, 100) : '未设置',
      },
      recommendations: [] as string[],
    };

    // 生成建议
    if (environmentInfo.isProduction) {
      if (!process.env.SECONDME_REDIRECT_URI ||
          process.env.SECONDME_REDIRECT_URI.includes('localhost') ||
          process.env.SECONDME_REDIRECT_URI.includes('your-project')) {
        configInfo.recommendations.push('SECONDME_REDIRECT_URI 应该设置为生产环境HTTPS地址');
      }

      if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost')) {
        configInfo.recommendations.push('DATABASE_URL 应该设置为生产环境数据库连接');
      }
    } else {
      configInfo.recommendations.push('当前为开发环境，使用默认配置');
    }

    return NextResponse.json(configInfo, {
      status: validationErrors.length > 0 ? 200 : 200, // 始终返回200，错误在响应体中
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Config check error:', error);
    return NextResponse.json({
      error: 'Configuration check failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

// 禁用缓存，确保获取实时配置
export const dynamic = 'force-dynamic';
export const revalidate = 0;