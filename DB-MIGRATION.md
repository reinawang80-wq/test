# 数据库迁移指南

## 问题描述

项目当前配置：
- **本地开发**: MySQL (`DATABASE_URL=mysql://...`)
- **生产环境**: PostgreSQL (`DATABASE_URL=postgresql://...`)
- **Prisma Schema**: 配置为 `provider = "postgresql"`

这导致本地开发可能遇到兼容性问题，因为生成的 Prisma 客户端期望 PostgreSQL。

## 解决方案

### 方案 A：本地切换到 PostgreSQL（推荐）

**步骤 1：启动 PostgreSQL 容器**
```bash
docker-compose up -d
```

**步骤 2：更新 .env.local**
```bash
# 注释掉 MySQL 配置
# DATABASE_URL=mysql://root:12345678@localhost:3306/secondme_db

# 启用 PostgreSQL 配置
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/secondme_db
```

**步骤 3：运行数据库迁移**
```bash
npx prisma db push
```

**步骤 4：重新生成 Prisma 客户端**
```bash
npx prisma generate
```

**步骤 5：重启开发服务器**
```bash
npm run dev
```

### 方案 B：保留 MySQL（需要修改 Schema）

如果希望本地继续使用 MySQL：

**步骤 1：修改 `prisma/schema.prisma`**
```prisma
datasource db {
  provider = "mysql"    # 改为 mysql
  url      = env("DATABASE_URL")
}
```

**步骤 2：更新生产环境配置**
注意：生产环境（Vercel + Neon）使用 PostgreSQL，需要保持 `postgresql`。
解决方案：
- 维护两个 schema 文件
- 或在部署时自动替换 provider

**步骤 3：重新生成客户端**
```bash
npx prisma generate
```

### 方案 C：数据迁移（MySQL → PostgreSQL）

如果本地有重要数据需要迁移到 PostgreSQL：

**步骤 1：导出 MySQL 数据**
```bash
mysqldump -u root -p12345678 secondme_db > dump.sql
```

**步骤 2：转换数据格式（可能需要手动调整）**
MySQL 和 PostgreSQL 语法有差异，需要处理：
- 自增主键
- 日期时间格式
- 引号转义

**步骤 3：导入到 PostgreSQL**
```bash
# 启动 PostgreSQL 容器
docker-compose up -d

# 导入数据（需要安装 pgloader 或手动转换）
# 简单方法：使用 Prisma 的 seed 脚本重新创建数据
```

## 生产环境数据库

生产环境使用 **Neon Postgres**（通过 Vercel Marketplace 集成）。

**重要事项：**
1. Neon 会自动注入 `DATABASE_URL` 环境变量
2. 部署后需要运行数据库迁移：
   ```bash
   npx prisma db push
   ```
3. 生产环境数据与本地开发数据独立

## 故障排除

### 错误：数据库连接失败
- 检查 PostgreSQL 容器是否运行：`docker ps`
- 验证连接字符串：`psql -h localhost -U postgres -d secondme_db`
- 查看日志：`docker logs secondme-postgres`

### 错误：Prisma 客户端不匹配
- 确保运行了 `npx prisma generate`
- 检查 `schema.prisma` 中的 provider 设置
- 清除 node_modules 并重新安装：`rm -rf node_modules && npm install`

### 错误：表不存在
- 运行 `npx prisma db push` 创建表结构
- 检查数据库迁移历史：`npx prisma migrate status`

## 后续建议

1. **统一数据库**：建议本地和生产环境都使用 PostgreSQL，避免兼容性问题
2. **使用 Docker**：确保环境一致性
3. **定期备份**：生产环境数据定期备份
4. **监控**：使用 Neon Dashboard 监控数据库性能