import { NextResponse } from 'next/server';

export async function GET() {
  console.log('测试API被调用');
  return NextResponse.json({
    code: 0,
    message: '测试成功',
    timestamp: Date.now()
  });
}