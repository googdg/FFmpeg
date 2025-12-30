# 🚀 部署指南

## 📋 部署方案概览

### 1. **GitHub Pages (前端展示)**
- ✅ 免费
- ✅ 自动部署
- ❌ 仅支持静态文件
- 🔗 访问地址: `https://googdg.github.io/FFmpeg`

### 2. **Vercel (全栈部署)**
- ✅ 免费额度
- ✅ 支持Node.js后端
- ✅ 自动HTTPS
- ✅ 全球CDN

### 3. **Railway (推荐)**
- ✅ 支持Docker
- ✅ 数据库支持
- ✅ 简单配置
- 💰 有免费额度

### 4. **自建服务器**
- ✅ 完全控制
- ✅ 支持所有功能
- 💰 需要服务器成本

---

## 🎯 **方案1: GitHub Pages 配置**

### 步骤1: 启用GitHub Pages

1. 访问仓库设置: https://github.com/googdg/FFmpeg/settings
2. 滚动到 **Pages** 部分
3. 选择 **Source**: `GitHub Actions`
4. 保存设置

### 步骤2: 配置前端构建

更新 `client/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/FFmpeg/', // GitHub仓库名
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

### 步骤3: 推送代码触发部署

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: 添加GitHub Pages自动部署"
git push origin main
```

---

## 🚀 **方案2: Vercel 部署 (推荐)**

### 步骤1: 连接Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub账号登录
3. 点击 **New Project**
4. 选择 `googdg/FFmpeg` 仓库
5. 配置项目设置

### 步骤2: 配置Vercel

创建 `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "server/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 步骤3: 环境变量配置

在Vercel Dashboard中设置:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret
CORS_ORIGIN=https://your-app.vercel.app
```

---

## 🛤️ **方案3: Railway 部署**

### 步骤1: 连接Railway

1. 访问 [railway.app](https://railway.app)
2. 使用GitHub登录
3. 点击 **New Project**
4. 选择 **Deploy from GitHub repo**
5. 选择 `googdg/FFmpeg`

### 步骤2: 配置Railway

创建 `railway.toml`:

```toml
[build]
builder = "dockerfile"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"

[[services]]
name = "web"
source = "."

[services.web]
buildCommand = "npm run build"
startCommand = "npm start"

[[services]]
name = "redis"
source = "redis:7-alpine"

[[services]]
name = "postgres"
source = "postgres:15-alpine"
```

### 步骤3: 环境变量

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=your-jwt-secret
FFMPEG_PATH=/usr/bin/ffmpeg
WHISPER_PATH=/usr/local/bin/whisper
```

---

## 🐳 **方案4: Docker + 云服务器**

### 步骤1: 优化Docker配置

更新 `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/transcription
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: transcription
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### 步骤2: Nginx配置

创建 `nginx.prod.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        client_max_body_size 500M;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/upload {
            proxy_pass http://app;
            proxy_request_buffering off;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### 步骤3: 部署脚本

创建 `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 开始部署媒体转录工具..."

# 拉取最新代码
git pull origin main

# 构建并启动服务
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# 等待服务启动
sleep 30

# 健康检查
if curl -f http://localhost/api/health; then
    echo "✅ 部署成功！"
    echo "🌐 访问地址: https://your-domain.com"
else
    echo "❌ 部署失败，请检查日志"
    docker-compose -f docker-compose.prod.yml logs
fi
```

---

## 🔧 **GitHub仓库配置**

### 1. 启用GitHub Pages

```bash
# 在GitHub仓库设置中:
# Settings > Pages > Source > GitHub Actions
```

### 2. 配置Secrets

在 `Settings > Secrets and variables > Actions` 中添加:

```
VERCEL_TOKEN=your-vercel-token
RAILWAY_TOKEN=your-railway-token
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
```

### 3. 保护主分支

```bash
# Settings > Branches > Add rule
# Branch name pattern: main
# ✅ Require pull request reviews
# ✅ Require status checks to pass
```

---

## 📊 **部署方案对比**

| 方案 | 成本 | 复杂度 | 功能支持 | 推荐指数 |
|------|------|--------|----------|----------|
| GitHub Pages | 免费 | ⭐ | 前端展示 | ⭐⭐⭐ |
| Vercel | 免费额度 | ⭐⭐ | 全栈 | ⭐⭐⭐⭐⭐ |
| Railway | 免费额度 | ⭐⭐ | 全栈+数据库 | ⭐⭐⭐⭐ |
| 自建服务器 | $5-50/月 | ⭐⭐⭐⭐ | 完整功能 | ⭐⭐⭐ |

---

## 🎯 **推荐部署流程**

### 阶段1: 快速展示 (GitHub Pages)
```bash
git add .github/workflows/deploy.yml
git commit -m "feat: 添加GitHub Pages部署"
git push origin main
```

### 阶段2: 完整功能 (Vercel)
1. 连接Vercel账号
2. 配置环境变量
3. 自动部署

### 阶段3: 生产环境 (Railway/自建)
1. 配置数据库
2. 设置域名
3. SSL证书

---

## 🔗 **访问地址**

部署完成后，你的应用将在以下地址可访问:

- **GitHub Pages**: `https://googdg.github.io/FFmpeg`
- **Vercel**: `https://ffmpeg-xxx.vercel.app`
- **Railway**: `https://ffmpeg-production-xxx.up.railway.app`
- **自定义域名**: `https://your-domain.com`

---

## 🆘 **故障排除**

### 常见问题

1. **构建失败**
   ```bash
   # 检查Node.js版本
   node --version  # 需要 18+
   
   # 清理缓存
   npm cache clean --force
   ```

2. **环境变量问题**
   ```bash
   # 检查环境变量
   echo $NODE_ENV
   
   # 验证配置
   npm run test:config
   ```

3. **CORS错误**
   ```javascript
   // 更新CORS配置
   app.use(cors({
     origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
     credentials: true
   }));
   ```

需要我帮你配置具体的部署方案吗？