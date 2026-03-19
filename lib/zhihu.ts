/**
 * 知乎开放平台 API 客户端
 * 用于知识检索能力 - 全网可信搜接口
 *
 * 文档参考：A2A for Reconnect 黑客松 - 知乎对外接口文档.pdf
 * 接口：/openapi/search/global
 *
 * 使用前请配置环境变量：
 * - ZHI_HU_API_BASE_URL: https://openapi.zhihu.com
 * - ZHI_HU_APP_KEY: 用户token（从知乎申请）
 * - ZHI_HU_APP_SECRET: 应用密钥（从知乎申请）
 */

import { createHmac } from 'crypto';

export interface ZhihuSearchParams {
  query: string;        // 查询关键词
  count?: number;       // 返回数量，最大20，默认10
}

export interface ZhihuSearchResultItem {
  title: string;                    // 内容标题
  content_type: string;             // 内容类型：Answer, Article, Question
  content_id: string;               // 内容ID
  content_text: string;             // 内容摘要
  url: string;                      // 原文链接
  comment_count: number;            // 评论数
  vote_up_count: number;            // 赞同数
  author_name: string;              // 作者名
  author_avatar: string;            // 作者头像
  author_badge: string;             // 作者徽章
  author_badge_text: string;        // 作者徽章文字
  edit_time: number;                // 编辑时间戳
  comment_info_list: Array<{        // 评论列表
    content: string;
  }>;
  authority_level: string;          // 权威等级
}

export interface ZhihuSearchResponse {
  status: number;                   // 0: 成功, 1: 失败
  msg: string;                      // 响应消息
  data: {
    has_more: boolean;              // 是否有更多结果
    items: ZhihuSearchResultItem[]; // 搜索结果列表
  } | null;
}

export class ZhihuClient {
  private baseUrl: string;
  private appKey: string;
  private appSecret: string;

  constructor() {
    this.baseUrl = process.env.ZHI_HU_API_BASE_URL || 'https://openapi.zhihu.com';
    this.appKey = process.env.ZHI_HU_APP_KEY || '';
    this.appSecret = process.env.ZHI_HU_APP_SECRET || '';

    console.log('知乎API配置初始化:');
    console.log('  baseUrl:', this.baseUrl);
    console.log('  appKey:', this.appKey ? '***' + this.appKey.slice(-4) : '(空)');
    console.log('  appSecret:', this.appSecret ? '***' + this.appSecret.slice(-4) : '(空)');

    if (!this.appKey || !this.appSecret) {
      console.warn('知乎API配置不完整，知识检索功能将不可用。请设置ZHI_HU_APP_KEY和ZHI_HU_APP_SECRET环境变量。');
    } else {
      console.log('知乎API配置完整，知识检索功能可用。');
    }
  }

  /**
   * 生成请求签名
   * @param timestamp 时间戳（秒）
   * @param logId 日志ID
   * @param extraInfo 扩展信息（透传）
   * @returns Base64编码的签名
   */
  private generateSignature(timestamp: string, logId: string, extraInfo: string = ''): string {
    // 构造待签名字符串：app_key:{app_key}|ts:{timestamp}|logid:{log_id}|extra_info:{extra_info}
    const signString = `app_key:${this.appKey}|ts:${timestamp}|logid:${logId}|extra_info:${extraInfo}`;

    // 使用 HMAC-SHA256 算法
    const hmac = createHmac('sha256', this.appSecret);
    hmac.update(signString);

    // Base64 编码
    return hmac.digest('base64');
  }

  /**
   * 搜索全网内容（知乎问答、文章等）
   * @param params 搜索参数
   * @returns 搜索结果
   */
  async search(params: ZhihuSearchParams): Promise<ZhihuSearchResponse> {
    if (!this.appKey || !this.appSecret) {
      return {
        status: 1,
        msg: '知乎API配置不完整，请设置ZHI_HU_APP_KEY和ZHI_HU_APP_SECRET环境变量',
        data: null
      };
    }

    const { query, count = 10 } = params;

    if (!query || query.trim() === '') {
      return {
        status: 1,
        msg: 'query is required',
        data: null
      };
    }

    // 限制返回数量（最大20）
    const actualCount = Math.min(Math.max(1, count), 20);

    try {
      // 生成请求参数
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const signature = this.generateSignature(timestamp, logId, '');

      // 构建请求头
      const headers = {
        'X-App-Key': this.appKey,
        'X-Timestamp': timestamp,
        'X-Log-Id': logId,
        'X-Sign': signature,
        'X-Extra-Info': '',
        'Content-Type': 'application/json'
      };

      // 编码查询参数
      const encodedQuery = encodeURIComponent(query.trim());

      // 构建URL
      const url = `${this.baseUrl}/openapi/search/global?query=${encodedQuery}&count=${actualCount}`;

      // 发送请求
      const response = await fetch(url, {
        method: 'GET',
        headers,
        // 知乎API有CORS限制，在服务端调用
      });

      if (!response.ok) {
        let errorMsg = `请求失败: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.msg || errorMsg;
        } catch {
          // 忽略JSON解析错误
        }

        return {
          status: 1,
          msg: errorMsg,
          data: null
        };
      }

      const result: ZhihuSearchResponse = await response.json();
      return result;

    } catch (error) {
      console.error('知乎搜索API调用失败:', error);

      return {
        status: 1,
        msg: error instanceof Error ? error.message : '未知错误',
        data: null
      };
    }
  }

  /**
   * 检查配置是否有效
   */
  isConfigured(): boolean {
    const configured = !!(this.appKey && this.appSecret);
    console.log(`知乎API配置检查: appKey=${this.appKey ? '***' + this.appKey.slice(-4) : '(空)'}, appSecret=${this.appSecret ? '***' + this.appSecret.slice(-4) : '(空)'}, configured=${configured}`);
    return configured;
  }
}

// 导出单例实例
export const zhihuClient = new ZhihuClient();