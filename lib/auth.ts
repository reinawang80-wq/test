import { cookies } from 'next/headers';
import { getOAuthConfig } from './config';
import { prisma } from './db';

// 生成OAuth state参数
export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 生成OAuth授权URL
export function getOAuthUrl(state: string): string {
  const oauthConfig = getOAuthConfig();
  const params = new URLSearchParams({
    client_id: oauthConfig.clientId,
    redirect_uri: oauthConfig.redirectUri,
    response_type: 'code',
    state,
    scope: 'user.info user.info.shades chat note.add',
  });

  return `${oauthConfig.authorizeUrl}?${params.toString()}`;
}

// 使用授权码交换token
export async function exchangeCodeForToken(code: string) {
  const oauthConfig = getOAuthConfig();
  console.log('Exchanging code for token, endpoint:', oauthConfig.tokenUrl);
  console.log('Client ID:', oauthConfig.clientId.substring(0, 8) + '...');

  // 使用 URL 编码格式，因为某些 OAuth2 服务要求这种格式
  const params = new URLSearchParams({
    client_id: oauthConfig.clientId,
    client_secret: oauthConfig.clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: oauthConfig.redirectUri,
  });

  // 调试日志（隐藏secret）
  const debugParams = new URLSearchParams(params);
  debugParams.set('client_secret', '***');
  console.log('Token exchange request:', {
    url: oauthConfig.tokenUrl,
    params: Object.fromEntries(debugParams),
    fullParams: debugParams.toString()
  });

  const response = await fetch(oauthConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const responseText = await response.text();
  console.log('Token exchange response status:', response.status);
  console.log('Token exchange response text:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));

  if (!response.ok) {
    console.error('Token exchange failed:', {
      status: response.status,
      statusText: response.statusText,
      responseText
    });
    throw new Error(`Token exchange failed: ${response.status}`);
  }

  let tokenData;
  try {
    tokenData = JSON.parse(responseText);
  } catch (e) {
    console.error('Failed to parse token exchange response as JSON:', responseText);
    throw new Error('Invalid JSON response from token endpoint');
  }

  console.log('Token exchange parsed data:', tokenData);

  // SecondMe API 返回格式: { code: 0, data: { accessToken, refreshToken, ... } }
  // 如果 code 存在且不为 0，表示业务错误
  if (tokenData.code && tokenData.code !== 0) {
    console.error('Token exchange business error:', tokenData);
    throw new Error(`Token exchange failed: ${tokenData.message || 'Unknown error'}`);
  }

  if (tokenData.code === 0 && tokenData.data) {
    const result = {
      access_token: tokenData.data.accessToken,
      refresh_token: tokenData.data.refreshToken,
      expires_in: tokenData.data.expiresIn,
      token_type: tokenData.data.tokenType || 'Bearer',
      scope: tokenData.data.scope || []
    };

    console.log('Token exchange successful:', {
      hasAccessToken: !!result.access_token,
      hasRefreshToken: !!result.refresh_token,
      expiresIn: result.expires_in,
      tokenKeys: Object.keys(result)
    });
    return result;
  }

  // 如果格式不符合预期，返回原始数据
  console.log('Token exchange successful (raw):', {
    hasAccessToken: !!tokenData.access_token,
    hasRefreshToken: !!tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    tokenKeys: Object.keys(tokenData)
  });
  return tokenData;
}

// 刷新access token
export async function refreshAccessToken(refreshToken: string) {
  const oauthConfig = getOAuthConfig();
  // 使用 URL 编码格式
  const params = new URLSearchParams({
    client_id: oauthConfig.clientId,
    client_secret: oauthConfig.clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  // 调试日志（隐藏secret）
  const debugParams = new URLSearchParams(params);
  debugParams.set('client_secret', '***');
  console.log('Token refresh request:', {
    url: oauthConfig.refreshUrl,
    params: Object.fromEntries(debugParams),
    fullParams: debugParams.toString()
  });

  const response = await fetch(oauthConfig.refreshUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token refresh failed:', errorText);
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  const responseText = await response.text();
  let tokenData;
  try {
    tokenData = JSON.parse(responseText);
  } catch (e) {
    console.error('Failed to parse token refresh response as JSON:', responseText);
    throw new Error('Invalid JSON response from token refresh endpoint');
  }

  // SecondMe API 返回格式: { code: 0, data: { ... } }
  if (tokenData.code && tokenData.code !== 0) {
    console.error('Token refresh business error:', tokenData);
    throw new Error(`Token refresh failed: ${tokenData.message || 'Unknown error'}`);
  }

  return tokenData;
}

// 获取当前用户（从cookie或session）
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  const accessToken = cookieStore.get('access_token')?.value;

  // 调试日志
  console.log('[Auth Debug] getCurrentUser called:', {
    env: process.env.NODE_ENV,
    hasUserId: !!userId,
    hasAccessToken: !!accessToken,
    userIdLength: userId?.length || 0,
    accessTokenLength: accessToken?.length || 0,
    cookies: Array.from(cookieStore.getAll()).map(c => c.name)
  });

  if (!userId || !accessToken) {
    // 开发环境下，如果未登录，尝试使用数据库中的第一个用户（仅用于测试）
    if (process.env.NODE_ENV === 'development') {
      try {
        const user = await prisma.user.findFirst({
          where: {
            secondmeUserId: { not: '' },
            accessToken: { not: '' },
          },
          orderBy: { createdAt: 'desc' },
        });
        if (user) {
          console.log('[DEV] Using fallback user:', user.secondmeUserId.substring(0, 8) + '...');
          return { userId: user.secondmeUserId, accessToken: user.accessToken };
        }
      } catch (error) {
        console.error('[DEV] Failed to get fallback user:', error);
      }
    }
    console.log('[Auth Debug] No valid cookies found, returning null');
    return null;
  }

  console.log('[Auth Debug] Returning user:', {
    userIdLength: userId.length,
    accessTokenLength: accessToken.length,
    userIdPrefix: userId.substring(0, 8) + '...'
  });
  return { userId, accessToken };
}

// 验证用户是否已登录
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}