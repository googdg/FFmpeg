# 🚀 快速部署指南

## 📋 部署方案对比

| 平台 | 难度 | 时间 | 成本 | 功能支持 | 推荐指数 |
|------|------|------|------|----------|----------|
| **Vercel** | ⭐ | 2分钟 | 免费 | 全栈 | ⭐⭐⭐⭐⭐ |
| **Railway** | ⭐⭐ | 3分钟 | 免费额度 | 完整 | ⭐⭐⭐⭐⭐ |
| **Netlify** | ⭐ | 2分钟 | 免费 | 前端 | ⭐⭐⭐ |
| **Render** | ⭐⭐ | 5分钟 | 免费额度 | 全栈 | ⭐⭐⭐⭐ |
| **GitHub Pages** | ⭐ | 1分钟 | 免费 | 静态 | ⭐⭐⭐ |

---

## 🎯 **方案1: Vercel (最推荐)**

### 优势
- ✅ 零配置部署
- ✅ 自动HTTPS
- ✅ 全球CDN
- ✅ 支持全栈应用

### 部署步骤
1. **访问**: https://vercel.com/new
2. **导入**: 选择 `googdg/FFmpeg` 仓库
3. **配置**:
   ```
   Framework Preset: Other
   Build Command: cd client && npm run build
   Output Directory: client/dist
   Install Command: npm install
   ```
4. **环境变量**:
   ```
   NODE_ENV=production
   ```
5. **部署**: 点击 Deploy

### 预期结果
- 🌐 访问地址: `https://ffmpeg-xxx.vercel.app`
- ⏱️ 部署时间: 2-3分钟
- 💰 成本: 免费

---

## 🚂 **方案2: Railway (完整功能)**

### 优势
- ✅ 支持数据库
- ✅ 支持Redis
- ✅ 完整后端功能
- ✅ 简单配置

### 部署步骤
1. **访问**: https://railway.app/new
2. **连接**: Deploy from GitHub repo
3. **选择**: `googdg/FFmpeg`
4. **自动部署**: Railway会读取 `railway.toml` 配置
5. **添加服务**:
   - PostgreSQL 数据库
   - Redis 缓存

### 预期结果
- 🌐 访问地址: `https://ffmpeg-production-xxx.up.railway.app`
- ⏱️ 部署时间: 3-5分钟
- 💰 成本: 免费额度 $5/月

---

## 📄 **方案3: Netlify (静态站点)**

### 优势
- ✅ 超快部署
- ✅ 优秀的CDN
- ✅ 简单易用

### 部署步骤
1. **访问**: https://app.netlify.com/start
2. **连接**: GitHub
3. **选择**: `googdg/FFmpeg`
4. **配置**:
   ```
   Base directory: client
   Build command: npm run build
   Publish directory: client/dist
   ```
5. **部署**: Deploy site

### 预期结果
- 🌐 访问地址: `https://ffmpeg-xxx.netlify.app`
- ⏱️ 部署时间: 1-2分钟
- 💰 成本: 免费

---

## 🎨 **方案4: Render**

### 优势
- ✅ 支持全栈
- ✅ 免费数据库
- ✅ 自动SSL

### 部署步骤
1. **访问**: https://render.com/new
2. **连接**: GitHub
3. **选择**: `googdg/FFmpeg`
4. **自动配置**: Render会读取 `render.yaml`
5. **等待部署**: 约5-10分钟

### 预期结果
- 🌐 访问地址: `https://ffmpeg-xxx.onrender.com`
- ⏱️ 部署时间: 5-10分钟
- 💰 成本: 免费

---

## 🐳 **方案5: Docker 本地部署**

### 优势
- ✅ 完全控制
- ✅ 本地测试
- ✅ 生产就绪

### 部署步骤
```bash
# 克隆仓库
git clone https://github.com/googdg/FFmpeg.git
cd FFmpeg

# 使用一键脚本
./deploy-all.sh

# 或手动部署
docker-compose -f docker-compose.prod.yml up -d
```

### 预期结果
- 🌐 访问地址: `http://localhost`
- ⏱️ 部署时间: 5-10分钟
- 💰 成本: 服务器成本

---

## ⚡ **一键部署脚本**

我已经为你创建了一键部署脚本：

```bash
# 进入项目目录
cd media-transcription-tool

# 运行一键部署
./deploy-all.sh
```

脚本功能：
- 🔍 自动检查依赖
- 🔨 自动构建项目
- 🚀 支持多平台部署
- 📊 实时部署状态
- 🎯 交互式选择

---

## 🔧 **故障排除**

### 常见问题

1. **构建失败**
   ```bash
   # 清理缓存
   rm -rf node_modules client/node_modules server/node_modules
   npm install
   ```

2. **环境变量问题**
   - 检查 `.env` 文件
   - 确认平台环境变量设置

3. **网络问题**
   ```bash
   # 使用国内镜像
   npm config set registry https://registry.npmmirror.com
   ```

4. **权限问题**
   ```bash
   # 修复权限
   chmod +x deploy-all.sh
   ```

### 获取帮助

- 📖 查看完整文档: `DEPLOYMENT_GUIDE.md`
- 🐛 报告问题: GitHub Issues
- 💬 社区支持: GitHub Discussions

---

## 🎉 **部署成功后**

### 验证部署
1. 访问应用URL
2. 检查健康状态: `/api/health`
3. 测试核心功能

### 监控和维护
- 📊 查看部署日志
- 🔍 监控应用性能
- 🔄 设置自动部署

### 自定义域名
大多数平台都支持自定义域名：
- Vercel: Project Settings > Domains
- Netlify: Site Settings > Domain management
- Railway: Project Settings > Domains

---

## 📞 **需要帮助？**

如果遇到任何问题：

1. **查看日志**: 每个平台都有详细的构建日志
2. **检查配置**: 确认环境变量和构建设置
3. **重新部署**: 大多数问题可以通过重新部署解决
4. **联系支持**: 各平台都有优秀的技术支持

**祝你部署成功！** 🎉