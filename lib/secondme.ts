// SecondMe API 客户端
import { getConfig, getApiUrl, getEndpoint } from './config';

export interface SecondMeUserInfo {
  user_id: string;
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  created_at?: string;
}

export interface SecondMeShade {
  id: string;
  name: string;
  category?: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 使用access token调用SecondMe API
export async function callSecondMeApi<T = any>(
  endpoint: string,
  accessToken: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = getApiUrl(endpoint);

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`SecondMe API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// 获取用户信息
export async function getUserInfo(accessToken: string): Promise<SecondMeUserInfo> {
  const endpoint = getEndpoint('user', 'info');
  const response = await callSecondMeApi<SecondMeUserInfo>(endpoint, accessToken);
  if (response.code !== 0) {
    throw new Error(`Failed to get user info: ${response.message}`);
  }
  return response.data;
}

// 获取用户兴趣标签
export async function getUserShades(accessToken: string): Promise<SecondMeShade[]> {
  const endpoint = getEndpoint('user', 'shades');
  const response = await callSecondMeApi<SecondMeShade[]>(endpoint, accessToken);
  if (response.code !== 0) {
    throw new Error(`Failed to get user shades: ${response.message}`);
  }
  return response.data;
}

// 搜索其他用户（假设有这个API，如果不存在需要调整）
export async function searchUsers(
  accessToken: string,
  params?: {
    keyword?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }
): Promise<{ users: SecondMeUserInfo[]; total: number }> {
  // 注意：SecondMe可能没有直接的搜索API
  // 这里是一个示例实现，需要根据实际API调整
  const queryParams = new URLSearchParams();
  if (params?.keyword) queryParams.set('keyword', params.keyword);
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());

  try {
    const baseEndpoint = getEndpoint('user', 'search');
    const endpoint = `${baseEndpoint}?${queryParams.toString()}`;

    const response = await callSecondMeApi<{ users: SecondMeUserInfo[]; total: number }>(endpoint, accessToken);
    if (response.code !== 0) {
      throw new Error(`Failed to search users: ${response.message}`);
    }
    return response.data;
  } catch (error) {
    // 如果API不存在，返回空结果
    console.warn('Search users API might not be available:', error);
    return { users: [], total: 0 };
  }
}