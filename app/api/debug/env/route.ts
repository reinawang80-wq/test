import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    ZHI_HU_API_BASE_URL: process.env.ZHI_HU_API_BASE_URL,
    ZHI_HU_APP_KEY: process.env.ZHI_HU_APP_KEY ? '***' + process.env.ZHI_HU_APP_KEY.slice(-4) : '(空)',
    ZHI_HU_APP_SECRET: process.env.ZHI_HU_APP_SECRET ? '***' + process.env.ZHI_HU_APP_SECRET.slice(-4) : '(空)',
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json({
    code: 0,
    data: envVars,
    message: '环境变量检查'
  });
}