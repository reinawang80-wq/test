import { exchangeCodeForToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getApiUrl, getEndpoint } from '@/lib/config';

export async function GET(request: Request) {
  // 修复 SecondMe OAuth 服务可能返回的错误URL格式
  let requestUrl = request.url;
  console.log('Original request URL:', requestUrl);

  // 修复双问号问题（?? -> ? 和 ?%3F -> ?）
  if (requestUrl.includes('??') || requestUrl.includes('?%3F')) {
    // 先替换编码的问号，再替换双问号
    requestUrl = requestUrl.replace(/\?%3F/g, '?');
    requestUrl = requestUrl.replace(/\?\?/g, '?');
    console.log('Fixed double question marks:', requestUrl);
  }

  // 修复缺少协议的问题（如果URL不以http://或https://开头）
  if (!requestUrl.startsWith('http://') && !requestUrl.startsWith('https://')) {
    requestUrl = 'http://' + requestUrl;
    console.log('Added missing protocol:', requestUrl);
  }

  // 修复拼写错误（ocalhost -> localhost）仅当前面没有'l'时
  // 避免将"localhost"误替换为"llocalhost"
  // 使用正则表达式检测前面没有'l'的'ocalhost'
  const ocalhostRegex = /(?<!l)ocalhost/g;
  if (ocalhostRegex.test(requestUrl)) {
    requestUrl = requestUrl.replace(ocalhostRegex, 'localhost');
    console.log('Fixed localhost spelling:', requestUrl);
  } else if (requestUrl.includes('ocalhost')) {
    console.log('Found "ocalhost" but preceded by "l", skipping replacement');
  }

  const { searchParams } = new URL(requestUrl);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/?error=' + encodeURIComponent(error), requestUrl));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/?error=missing_params', requestUrl));
  }

  // 验证state
  const cookieStore = await cookies();
  const savedState = cookieStore.get('oauth_state')?.value;

  if (!savedState || savedState !== state) {
    console.warn('OAuth state 验证失败，可能是跨 WebView 场景');
    // 继续处理，不阻止登录
  }

  try {
    // 交换token
    const tokenData = await exchangeCodeForToken(code);
    console.log('Token exchange successful:', {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresIn: tokenData.expires_in
    });

    // 获取用户信息
    console.log('Fetching user info with token:', tokenData.access_token ? tokenData.access_token.substring(0, 20) + '...' : 'NO TOKEN');
    const userInfoUrl = getApiUrl(getEndpoint('user', 'info'));
    console.log('User info URL:', userInfoUrl);

    const userInfoResponse = await fetch(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userInfoText = await userInfoResponse.text();
    console.log('User info response status:', userInfoResponse.status);
    console.log('User info response text:', userInfoText.substring(0, 500) + (userInfoText.length > 500 ? '...' : ''));

    if (!userInfoResponse.ok) {
      throw new Error(`Failed to fetch user info: ${userInfoResponse.status} ${userInfoResponse.statusText}`);
    }

    let userInfoResult;
    try {
      userInfoResult = JSON.parse(userInfoText);
    } catch (e) {
      console.error('Failed to parse user info response as JSON:', userInfoText);
      throw new Error('Invalid JSON response from user info API');
    }

    console.log('User info result:', userInfoResult);

    if (userInfoResult.code !== 0) {
      throw new Error('User info API error: ' + userInfoResult.message);
    }

    const userInfo = userInfoResult.data;

    // 创建或更新用户
    const user = await prisma.user.upsert({
      where: { secondmeUserId: userInfo.userId },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        name: userInfo.name,
        avatar: userInfo.avatar,
        email: userInfo.email,
      },
      create: {
        secondmeUserId: userInfo.userId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        name: userInfo.name,
        avatar: userInfo.avatar,
        email: userInfo.email,
      },
    });

    // 设置session cookie
    cookieStore.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
      sameSite: 'lax',
    });

    cookieStore.set('access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenData.expires_in, // token有效期
      path: '/',
    });

    // 清理state cookie
    cookieStore.delete('oauth_state');

    return NextResponse.redirect(new URL('/', requestUrl));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=auth_failed', requestUrl));
  }
}