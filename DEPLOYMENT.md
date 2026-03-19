# SecondMe 人生设计社区 - 部署指南

## 部署到 Vercel（推荐）

### 前提条件
1. **Vercel 账户**：注册 [vercel.com](https://vercel.com)
2. **GitHub/GitLab 仓库**：将代码推送到远程仓库
3. **SecondMe 开发者账户**：需要配置 OAuth 回调地址

### 步骤 1：准备代码
```bash
# 确保项目可以正常构建
npm run build

# 提交所有更改到 Git
git add .
git commit -m "准备部署"
git push
```

### 步骤 2：配置 Vercel 环境变量

在 Vercel 控制台的项目设置中，添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://...` | **重要**：在 Vercel 创建 Postgres 数据库后自动生成 |
| `SECONDME_CLIENT_ID` | `75fd5283-eefc-46fa-9d3b-8605690075ad` | 保持不变 |
| `SECONDME_CLIENT_SECRET` | 你的 SecondMe Client Secret | 从 SecondMe 开发者控制台获取 |
| `SECONDME_REDIRECT_URI` | `https://your-project.vercel.app/api/auth/callback` | **必须修改**：替换为你的 Vercel 域名 |
| `SECONDME_API_BASE_URL` | `https://api.mindverse.com/gate/lab` | 保持不变 |
| `SECONDME_OAUTH_URL` | `https://go.second.me/oauth/` | 保持不变 |
| `SECONDME_TOKEN_ENDPOINT` | `https://api.mindverse.com/gate/lab/api/oauth/token/code` | 保持不变 |
| `SECONDME_REFRESH_ENDPOINT` | `https://api.mindverse.com/gate/lab/api/oauth/token/refresh` | 保持不变 |

**知乎 API（可选）**：
| 变量名 | 值 |
|--------|-----|
| `ZHI_HU_API_BASE_URL` | `https://openapi.zhihu.com` |
| `ZHI_HU_APP_KEY` | 你的知乎 App Key |
| `ZHI_HU_APP_SECRET` | 你的知乎 App Secret |

### 步骤 3：创建 Vercel Postgres 数据库
1. 在 Vercel 控制台，进入 "Storage" 标签页
2. 点击 "Create Database"，选择 PostgreSQL
3. 数据库创建后，Vercel 会自动注入 `DATABASE_URL` 环境变量
4. **重要**：需要运行数据库迁移
   ```bash
   # 本地运行迁移（需要先设置 DATABASE_URL）
   npx prisma migrate dev --name init

   # 或者在生产环境运行
   npx prisma db push
   ```

### 步骤 4：配置 SecondMe OAuth 回调地址
**必须操作**：否则登录功能无法工作

1. 登录 [SecondMe 开发者控制台](https://go.second.me/oauth/)
2. 找到你的应用（Client ID: `75fd5283-eefc-46fa-9d3b-8605690075ad`）
3. 在 "Redirect URIs" 中添加：
   ```
   https://your-project.vercel.app/api/auth/callback
   ```
4. 保存更改

### 步骤 5：部署到 Vercel

**方法 A：通过 Vercel Dashboard**
1. 访问 [vercel.com/new](https://vercel.com/new)
2. 导入你的 Git 仓库
3. Vercel 会自动检测为 Next.js 项目
4. 确认环境变量已正确设置
5. 点击 "Deploy"

**方法 B：使用 Vercel CLI**
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 步骤 6：验证部署

1. 访问你的 Vercel 域名
2. 测试 OAuth 登录流程
3. 检查数据库连接
4. 验证各功能模块

## 故障排除

### 常见问题 1：OAuth 登录失败
- **症状**：点击登录后重定向到错误页面
- **原因**：回调地址未正确配置
- **解决方案**：
  1. 确认 Vercel 环境变量 `SECONDME_REDIRECT_URI` 正确
  2. 确认 SecondMe 开发者控制台的 Redirect URIs 包含该地址
  3. 检查是否有拼写错误

### 常见问题 2：数据库连接失败
- **症状**：页面显示数据库错误
- **原因**：`DATABASE_URL` 未设置或格式错误
- **解决方案**：
  1. 确认 Vercel Postgres 已创建
  2. 确认 `DATABASE_URL` 环境变量存在
  3. 运行数据库迁移：`npx prisma db push`

### 常见问题 3：构建失败
- **症状**：Vercel 部署构建失败
- **原因**：代码错误或依赖问题
- **解决方案**：
  1. 本地运行 `npm run build` 检查错误
  2. 查看 Vercel 构建日志
  3. 确保所有 TypeScript 错误已修复

## 生产环境优化建议

### 1. 自定义域名（可选）
1. 在 Vercel 控制台添加自定义域名
2. 更新 DNS 记录
3. **重要**：更新 `SECONDME_REDIRECT_URI` 环境变量和 SecondMe 回调地址

### 2. 监控和日志
- 使用 Vercel Analytics 监控性能
- 查看 Function 日志排查 API 错误

### 3. 安全建议
- 定期轮换 `SECONDME_CLIENT_SECRET`
- 使用强密码保护数据库
- 启用 Vercel 的安全功能

## 本地开发 vs 生产环境

| 配置项 | 本地开发 | 生产环境 |
|--------|----------|----------|
| 数据库 | MySQL (localhost) | Vercel Postgres |
| 回调地址 | `http://localhost:3000/api/auth/callback` | `https://your-domain.com/api/auth/callback` |
| 环境变量文件 | `.env.local` | Vercel 环境变量 |
| Prisma Provider | `mysql` | `postgresql` |

## 更新部署
当代码更新时，只需推送到 Git 主分支，Vercel 会自动重新部署。

```bash
git add .
git commit -m "更新功能"
git push origin main
```

## 联系方式
如有部署问题，请参考：
- [Vercel 文档](https://vercel.com/docs)
- [SecondMe API 文档](https://api.mindverse.com/gate/lab/docs)
- [项目问题反馈](https://github.com/your-username/secondme-website/issues)