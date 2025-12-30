#!/bin/bash

echo "🔍 GitHub Pages 状态检查工具"
echo "=============================="

# 获取仓库信息
REPO_URL=$(git remote get-url origin 2>/dev/null)
if [ -z "$REPO_URL" ]; then
    echo "❌ 未找到Git仓库"
    exit 1
fi

# 解析仓库信息
if [[ $REPO_URL =~ github\.com[:/]([^/]+)/([^/.]+) ]]; then
    USERNAME="${BASH_REMATCH[1]}"
    REPO_NAME="${BASH_REMATCH[2]}"
else
    echo "❌ 无法解析GitHub仓库信息"
    exit 1
fi

echo "👤 用户名: $USERNAME"
echo "📁 仓库名: $REPO_NAME"
echo ""

# 检查GitHub Pages URL
PAGES_URL="https://$USERNAME.github.io/$REPO_NAME"
echo "🌐 GitHub Pages地址: $PAGES_URL"

# 检查网站是否可访问
echo "🔍 检查网站状态..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PAGES_URL" --max-time 10)

case $HTTP_STATUS in
    200)
        echo "✅ 网站正常运行 (HTTP $HTTP_STATUS)"
        ;;
    404)
        echo "⚠️  网站未找到 (HTTP $HTTP_STATUS)"
        echo "   可能原因:"
        echo "   - GitHub Pages未启用"
        echo "   - 部署尚未完成"
        echo "   - 路径配置错误"
        ;;
    000)
        echo "❌ 无法连接到网站"
        echo "   可能原因:"
        echo "   - 网络连接问题"
        echo "   - 网站尚未部署"
        ;;
    *)
        echo "⚠️  网站状态异常 (HTTP $HTTP_STATUS)"
        ;;
esac

echo ""
echo "🔗 相关链接:"
echo "- 仓库地址: https://github.com/$USERNAME/$REPO_NAME"
echo "- Actions状态: https://github.com/$USERNAME/$REPO_NAME/actions"
echo "- Pages设置: https://github.com/$USERNAME/$REPO_NAME/settings/pages"
echo "- 网站地址: $PAGES_URL"

# 检查最近的提交
echo ""
echo "📝 最近提交:"
git log --oneline -3 2>/dev/null || echo "   无法获取提交历史"

# 检查GitHub Actions状态 (需要gh CLI)
if command -v gh &> /dev/null; then
    echo ""
    echo "🔄 GitHub Actions状态:"
    gh run list --limit 3 2>/dev/null || echo "   无法获取Actions状态 (请确保已登录gh CLI)"
else
    echo ""
    echo "💡 提示: 安装GitHub CLI (gh) 可查看更多状态信息"
    echo "   安装命令: brew install gh"
fi

echo ""
echo "🛠️  故障排除建议:"
echo "1. 确认GitHub Pages已在仓库设置中启用"
echo "2. 检查GitHub Actions是否成功运行"
echo "3. 验证构建输出目录是否正确"
echo "4. 确认base路径配置是否匹配仓库名"