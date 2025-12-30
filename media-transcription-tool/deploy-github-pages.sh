#!/bin/bash

echo "🚀 开始部署到GitHub Pages..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 进入客户端目录
cd client

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
NODE_ENV=production npm run build

# 返回根目录
cd ..

# 提交更改
echo "📝 提交更改..."
git add .
git commit -m "feat: 更新部署配置和构建设置"

# 推送到GitHub
echo "⬆️ 推送到GitHub..."
git push origin main

echo "✅ 部署完成！"
echo "🌐 GitHub Pages将在几分钟后更新"
echo "📱 访问地址: https://googdg.github.io/FFmpeg"
echo ""
echo "📋 接下来的步骤:"
echo "1. 访问 https://github.com/googdg/FFmpeg/settings/pages"
echo "2. 在Source中选择 'GitHub Actions'"
echo "3. 等待Actions完成构建"