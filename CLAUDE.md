# SecondMe 集成项目

## 应用信息

- **App Name**: secondme-app
- **Client ID**: 75fd5283-****-****-****-8605690075ad

## API 文档

开发时请参考官方文档（从 `.secondme/state.json` 的 `docs` 字段读取）：

| 文档 | 配置键 |
|------|--------|
| 快速入门 | `docs.quickstart` |
| OAuth2 认证 | `docs.oauth2` |
| API 参考 | `docs.api_reference` |
| 错误码 | `docs.errors` |

## 关键信息

- API 基础 URL: https://api.mindverse.com/gate/lab
- OAuth 授权 URL: https://go.second.me/oauth/
- Access Token 有效期: 2 小时
- Refresh Token 有效期: 30 天

> 所有 API 端点配置请参考 `.secondme/state.json` 中的 `api` 和 `docs` 字段

## 已选模块

- auth (OAuth认证，必选)
- profile (用户信息展示)
- chat (聊天功能)
- note (笔记功能)

## 权限列表 (Scopes)

根据配置的 Allowed Scopes：

| 权限 | 说明 | 状态 |
|------|------|------|
| `user.info` | 用户基础信息 | ✅ 已授权 |
| `user.info.shades` | 用户兴趣标签 | ✅ 已授权 |
| `chat` | 聊天功能 | ✅ 已授权 |
| `note.add` | 添加笔记 | ✅ 已授权 |

## 知识检索能力（知乎开放平台）

### 功能说明
知识框架页面现已集成知乎开放平台的「全网可信搜接口」，提供全网知识内容检索能力。

### API 配置
| 环境变量 | 说明 | 获取方式 |
|----------|------|----------|
| `ZHI_HU_API_BASE_URL` | 知乎开放平台基础URL | `https://openapi.zhihu.com` |
| `ZHI_HU_APP_KEY` | 用户token（应用密钥） | 添加群内 @王佳蕴，提供知乎主页链接 |
| `ZHI_HU_APP_SECRET` | 应用密钥 | 同上，妥善保管不要泄露 |

### 接口信息
- **接口路径**: `/openapi/search/global`
- **请求方法**: GET
- **认证方式**: HMAC-SHA256 签名认证
- **限流规则**: 单用户 1次/秒，总调用量 1000次/用户

### 使用方式
1. 在知识框架页面切换到「全网知识检索」标签页
2. 输入搜索关键词（如：学习方法、个人成长）
3. 点击「全网搜索」按钮获取知乎等平台的问答、文章等内容

### 文档参考
- 详细接口文档：`A2A for Reconnect 黑客松 - 知乎对外接口文档.pdf`（位于Downloads目录）
- 签名算法：HMAC-SHA256，参考 `lib/zhihu.ts` 实现