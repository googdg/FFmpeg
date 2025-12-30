#!/bin/bash

echo "🚀 GitHub Pages 部署工具"
echo "=========================="

# 检查Git状态
if ! git diff --quiet; then
    echo "⚠️  检测到未提交的更改"
    read -p "是否继续部署? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 部署已取消"
        exit 1
    fi
fi

# 选择项目
echo "📁 选择要部署的项目:"
echo "1. Media Transcription Tool"
echo "2. 当前目录项目"
echo "3. 其他项目"

read -p "请选择 (1-3): " choice

case $choice in
    1)
        PROJECT_DIR="media-transcription-tool"
        REPO_NAME="FFmpeg"
        ;;
    2)
        PROJECT_DIR="."
        REPO_NAME=$(basename $(pwd))
        ;;
    3)
        read -p "请输入项目目录: " PROJECT_DIR
        read -p "请输入仓库名称: " REPO_NAME
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo "📦 项目目录: $PROJECT_DIR"
echo "🌐 仓库名称: $REPO_NAME"

# 进入项目目录
cd "$PROJECT_DIR" || {
    echo "❌ 无法进入目录: $PROJECT_DIR"
    exit 1
}

# 检查是否有package.json
if [ -f "client/package.json" ]; then
    CLIENT_DIR="client"
elif [ -f "package.json" ]; then
    CLIENT_DIR="."
else
    echo "❌ 未找到package.json文件"
    exit 1
fi

echo "🔨 开始构建..."

# 进入客户端目录并构建
cd "$CLIENT_DIR"
npm install || {
    echo "❌ 依赖安装失败"
    exit 1
}

NODE_ENV=production npm run build || {
    echo "❌ 构建失败"
    exit 1
}

# 返回项目根目录
if [ "$CLIENT_DIR" != "." ]; then
    cd ..
fi

echo "✅ 构建完成"

# Git操作
echo "📝 提交更改..."
git add .
git commit -m "feat: 更新GitHub Pages部署

🚀 部署信息:
- 项目: $REPO_NAME
- 时间: $(date '+%Y-%m-%d %H:%M:%S')
- 构建: 生产环境优化

🌐 访问地址: https://googdg.github.io/$REPO_NAME" || {
    echo "ℹ️  没有新的更改需要提交"
}

echo "⬆️ 推送到GitHub..."
git push origin main || {
    echo "❌ 推送失败"
    exit 1
}

echo ""
echo "🎉 部署配置完成！"
echo ""
echo "📋 接下来的步骤:"
echo "1. 访问: https://github.com/googdg/$REPO_NAME/settings/pages"
echo "2. 在Source中选择 'GitHub Actions'"
echo "3. 等待Actions完成构建 (约2-3分钟)"
echo "4. 访问: https://googdg.github.io/$REPO_NAME"
echo ""
echo "🔍 监控部署状态:"
echo "- Actions: https://github.com/googdg/$REPO_NAME/actions"
echo "- Pages设置: https://github.com/googdg/$REPO_NAME/settings/pages"
echo ""
echo "💡 提示: 首次部署可能需要几分钟才能生效"