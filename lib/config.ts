// SecondMe 配置管理器
import fs from 'fs';
import path from 'path';

export interface SecondMeConfig {
  app: {
    name: string;
    client_id: string;
  };
  api: {
    base_url: string;
    endpoints: {
      oauth: {
        authorize: string;
        token: string;
        refresh: string;
      };
      user: {
        info: string;
        shades: string;
        search: string;
      };
      chat: {
        send: string;
      };
      note: {
        add: string;
        update: string;
        delete: string;
        list: string;
      };
      act: {
        judge: string;
      };
    };
    timeouts: {
      access_token: number;
      refresh_token: number;
    };
  };
  docs: {
    quickstart: string;
    oauth2: string;
    api_reference: string;
    errors: string;
  };
  modules: {
    auth: boolean;
    profile: boolean;
    chat: boolean;
    note: boolean;
  };
  scopes: string[];
}

// 加载配置
let config: SecondMeConfig | null = null;

export function loadConfig(): SecondMeConfig {
  if (config) {
    return config;
  }

  try {
    const configPath = path.join(process.cwd(), '.secondme', 'state.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(configData) as SecondMeConfig;
    return config;
  } catch (error) {
    console.error('Failed to load SecondMe config:', error);
    // 返回默认配置（兼容旧代码）
    return {
      app: {
        name: 'secondme-app',
        client_id: process.env.SECONDME_CLIENT_ID || '',
      },
      api: {
        base_url: process.env.SECONDME_API_BASE_URL || 'https://api.mindverse.com/gate/lab',
        endpoints: {
          oauth: {
            authorize: process.env.SECONDME_OAUTH_URL || 'https://go.second.me/oauth/',
            token: process.env.SECONDME_TOKEN_ENDPOINT || 'https://api.mindverse.com/gate/lab/api/oauth/token/code',
            refresh: process.env.SECONDME_REFRESH_ENDPOINT || 'https://api.mindverse.com/gate/lab/api/oauth/token/refresh',
          },
          user: {
            info: '/api/secondme/user/info',
            shades: '/api/secondme/user/shades',
            search: '/api/secondme/users/search',
          },
          chat: {
            send: '/api/secondme/chat',
          },
          note: {
            add: '/api/secondme/note/add',
            update: '/api/secondme/note/update',
            delete: '/api/secondme/note/delete',
            list: '/api/secondme/note/list',
          },
          act: {
            judge: '/api/secondme/act',
          },
        },
        timeouts: {
          access_token: 7200,
          refresh_token: 2592000,
        },
      },
      docs: {
        quickstart: 'https://docs.second.me/quickstart',
        oauth2: 'https://docs.second.me/oauth2',
        api_reference: 'https://docs.second.me/api',
        errors: 'https://docs.second.me/errors',
      },
      modules: {
        auth: true,
        profile: true,
        chat: true,
        note: true,
      },
      scopes: ['user.info', 'user.info.shades', 'chat', 'note.add'],
    };
  }
}

// 获取配置实例
export function getConfig(): SecondMeConfig {
  return loadConfig();
}

// 获取完整的API URL
export function getApiUrl(endpointPath: string): string {
  const config = getConfig();
  const baseUrl = config.api.base_url.endsWith('/')
    ? config.api.base_url.slice(0, -1)
    : config.api.base_url;

  const normalizedPath = endpointPath.startsWith('/')
    ? endpointPath
    : `/${endpointPath}`;

  return `${baseUrl}${normalizedPath}`;
}

// 获取特定端点
export function getEndpoint(category: keyof SecondMeConfig['api']['endpoints'], endpoint: string): string {
  const config = getConfig();
  const categoryEndpoints = config.api.endpoints[category];

  if (typeof categoryEndpoints !== 'object' || !(endpoint in categoryEndpoints)) {
    throw new Error(`Endpoint ${category}.${endpoint} not found in config`);
  }

  return (categoryEndpoints as any)[endpoint];
}

// 获取OAuth配置
export function getOAuthConfig() {
  const config = getConfig();
  return {
    clientId: process.env.SECONDME_CLIENT_ID || config.app.client_id,
    clientSecret: process.env.SECONDME_CLIENT_SECRET || '',
    redirectUri: process.env.SECONDME_REDIRECT_URI || 'http://localhost:3000/api/auth/callback',
    authorizeUrl: config.api.endpoints.oauth.authorize,
    tokenUrl: config.api.endpoints.oauth.token,
    refreshUrl: config.api.endpoints.oauth.refresh,
  };
}