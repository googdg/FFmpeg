# 🌐 GitHub Pages 免费托管完整指南

## 📋 概述

GitHub Pages是GitHub提供的免费静态网站托管服务，非常适合部署前端应用、文档站点和个人博客。

## ✨ GitHub Pages 优势

### 🆓 完全免费
- 无任何费用
- 每个GitHub账户可创建一个用户站点
- 每个仓库可创建一个项目站点

### 🚀 简单易用
- 几分钟即可配置完成
- 自动部署，推送代码即更新
- 支持自定义域名

### 🔒 安全可靠
- 自动HTTPS证书
- GitHub的全球CDN加速
- 99.9%的可用性保证

### 📊 技术规格
- **存储限制**: 1GB
- **带宽限制**: 每月100GB
- **构建时间**: 每次10分钟
- **支持格式**: 静态HTML、CSS、JavaScript

## 🛠️ 部署方式对比

### 方式1: GitHub Actions (推荐)
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
      - uses: actions/deploy-pages@v4
```

### 方式2: 直接从分支部署
- 适合简单的静态站点
- 直接从`main`或`gh-pages`分支部署
- 无需构建过程

## 🚀 快速开始

### 1. 启用GitHub Pages

1. **访问仓库设置**
   ```
   https://github.com/[用户名]/[仓库名]/settings/pages
   ```

2. **选择部署源**
   - **GitHub Actions** (推荐): 支持自定义构建流程
   - **Deploy from branch**: 直接从分支部署

3. **配置自定义域名** (可选)
   - 添加CNAME文件到仓库根目录
   - 在设置中输入自定义域名

### 2. 项目配置示例

#### React/Vite项目
```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

```js
// vite.config.js
export default {
  base: process.env.NODE_ENV === 'production' ? '/仓库名/' : '/',
  build: {
    outDir: 'dist'
  }
}
```

#### Vue项目
```js
// vue.config.js
module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/仓库名/' : '/'
}
```

#### Next.js项目
```js
// next.config.js
module.exports = {
  basePath: process.env.NODE_ENV === 'production' ? '/仓库名' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/仓库名/' : '',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}
```

## 📁 项目结构示例

```
my-project/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions配置
├── src/                        # 源代码
├── public/                     # 静态资源
├── dist/                       # 构建输出 (自动生成)
├── package.json
└── README.md
```

## 🔧 高级配置

### 环境变量设置
```yaml
# .github/workflows/deploy.yml
env:
  NODE_ENV: production
  PUBLIC_URL: https://用户名.github.io/仓库名
```

### 多环境部署
```yaml
# 生产环境
- name: Build for production
  run: npm run build
  env:
    NODE_ENV: production

# 预览环境  
- name: Build for preview
  run: npm run build:preview
  if: github.ref != 'refs/heads/main'
```

### 缓存优化
```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

## 🌍 访问地址格式

### 用户/组织站点
```
https://用户名.github.io
```

### 项目站点
```
https://用户名.github.io/仓库名
```

### 自定义域名
```
https://你的域名.com
```

## 🔍 常见问题解决

### 1. 404错误
- 检查`base`路径配置是否正确
- 确认文件路径大小写匹配
- 验证`index.html`是否在正确位置

### 2. 资源加载失败
```js
// 修复资源路径
const publicPath = process.env.NODE_ENV === 'production' 
  ? '/仓库名/' 
  : '/';
```

### 3. 路由问题 (SPA)
```html
<!-- 添加到public/index.html -->
<script>
  // 处理GitHub Pages的SPA路由
  (function(l) {
    if (l.search[1] === '/' ) {
      var decoded = sessionStorage.redirect;
      delete sessionStorage.redirect;
      if (decoded) {
        l.replace(l.pathname.split('?')[0] + decoded);
      }
    }
  }(window.location))
</script>
```

### 4. 构建失败
- 检查Node.js版本兼容性
- 确认依赖安装完整
- 查看Actions日志定位错误

## 📊 性能优化

### 1. 资源压缩
```js
// vite.config.js
export default {
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
}
```

### 2. 图片优化
- 使用WebP格式
- 实现懒加载
- 压缩图片大小

### 3. 缓存策略
```html
<!-- 设置缓存头 -->
<meta http-equiv="Cache-Control" content="max-age=31536000">
```

## 🔐 安全最佳实践

### 1. 环境变量管理
```yaml
# 使用GitHub Secrets
- name: Build with secrets
  run: npm run build
  env:
    API_KEY: ${{ secrets.API_KEY }}
```

### 2. 依赖安全
```yaml
# 安全审计
- name: Security audit
  run: npm audit --audit-level high
```

## 📈 监控和分析

### 1. Google Analytics
```html
<!-- 添加到index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### 2. 性能监控
```js
// 添加性能监控
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

## 🎯 部署检查清单

- [ ] ✅ GitHub Actions配置正确
- [ ] ✅ 构建脚本无错误
- [ ] ✅ 路径配置正确
- [ ] ✅ 静态资源可访问
- [ ] ✅ 移动端适配良好
- [ ] ✅ SEO优化完成
- [ ] ✅ 性能测试通过
- [ ] ✅ 安全检查完成

## 🔗 相关链接

- [GitHub Pages官方文档](https://docs.github.com/en/pages)
- [GitHub Actions文档](https://docs.github.com/en/actions)
- [自定义域名配置](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

## 💡 小贴士

1. **定期更新依赖**: 保持安全性和性能
2. **监控构建时间**: 避免超出10分钟限制
3. **优化资源大小**: 提升加载速度
4. **使用CDN**: 进一步提升全球访问速度
5. **备份重要数据**: 虽然GitHub很可靠，但备份总是好的

---

🎉 **恭喜！你现在已经掌握了GitHub Pages的完整部署流程！**