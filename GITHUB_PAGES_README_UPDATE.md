# GitHub Pages 部署说明

## 🌐 在线访问

**网站地址**: https://googdg.github.io/FFmpeg

## 🚀 快速部署

```bash
# 一键部署
./deploy-github-pages.sh

# 检查状态
./check-github-pages.sh

# 测试配置
./test-github-pages-config.sh
```

## 📋 部署要求

- ✅ GitHub仓库
- ✅ Node.js 16+
- ✅ npm或yarn

## 🔧 配置文件

- `.github/workflows/deploy.yml` - GitHub Actions配置
- `client/vite.config.ts` - Vite构建配置
- `deploy-github-pages.sh` - 部署脚本

## 📚 详细文档

- [完整部署指南](GITHUB_PAGES_GUIDE.md)
- [部署演示](GITHUB_PAGES_DEMO.md)
- [就绪检查](GITHUB_PAGES_READY.md)

---

*GitHub Pages提供免费的静态网站托管，支持自动部署和HTTPS。*