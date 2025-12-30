#!/bin/bash

echo "🧪 GitHub Pages 配置测试"
echo "========================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试函数
test_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

test_fail() {
    echo -e "${RED}❌ $1${NC}"
}

test_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

test_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo ""
echo "📁 检查项目结构..."

# 检查media-transcription-tool项目
if [ -d "media-transcription-tool" ]; then
    test_pass "找到 media-transcription-tool 项目目录"
    
    # 检查GitHub Actions配置
    if [ -f "media-transcription-tool/.github/workflows/deploy.yml" ]; then
        test_pass "GitHub Actions配置文件存在"
        
        # 检查配置内容
        if grep -q "actions/deploy-pages@v4" "media-transcription-tool/.github/workflows/deploy.yml"; then
            test_pass "使用最新的deploy-pages action"
        else
            test_warn "建议更新到最新的deploy-pages action"
        fi
        
        if grep -q "permissions:" "media-transcription-tool/.github/workflows/deploy.yml"; then
            test_pass "权限配置正确"
        else
            test_fail "缺少必要的权限配置"
        fi
    else
        test_fail "GitHub Actions配置文件不存在"
    fi
    
    # 检查客户端配置
    if [ -f "media-transcription-tool/client/vite.config.ts" ]; then
        test_pass "Vite配置文件存在"
        
        if grep -q "/FFmpeg/" "media-transcription-tool/client/vite.config.ts"; then
            test_pass "base路径配置正确 (/FFmpeg/)"
        else
            test_warn "请检查base路径配置"
        fi
    else
        test_fail "Vite配置文件不存在"
    fi
    
    # 检查package.json
    if [ -f "media-transcription-tool/client/package.json" ]; then
        test_pass "客户端package.json存在"
        
        if grep -q '"build"' "media-transcription-tool/client/package.json"; then
            test_pass "构建脚本已配置"
        else
            test_fail "缺少构建脚本"
        fi
    else
        test_fail "客户端package.json不存在"
    fi
    
else
    test_fail "未找到 media-transcription-tool 项目目录"
fi

echo ""
echo "🔧 检查部署工具..."

# 检查部署脚本
if [ -f "deploy-github-pages.sh" ]; then
    test_pass "部署脚本存在"
    if [ -x "deploy-github-pages.sh" ]; then
        test_pass "部署脚本可执行"
    else
        test_warn "部署脚本不可执行，运行: chmod +x deploy-github-pages.sh"
    fi
else
    test_fail "部署脚本不存在"
fi

# 检查状态检查工具
if [ -f "check-github-pages.sh" ]; then
    test_pass "状态检查工具存在"
    if [ -x "check-github-pages.sh" ]; then
        test_pass "状态检查工具可执行"
    else
        test_warn "状态检查工具不可执行，运行: chmod +x check-github-pages.sh"
    fi
else
    test_fail "状态检查工具不存在"
fi

echo ""
echo "🌐 检查Git配置..."

# 检查Git仓库
if [ -d ".git" ]; then
    test_pass "Git仓库已初始化"
    
    # 检查远程仓库
    REMOTE_URL=$(git remote get-url origin 2>/dev/null)
    if [ -n "$REMOTE_URL" ]; then
        test_pass "远程仓库已配置: $REMOTE_URL"
        
        if [[ $REMOTE_URL == *"github.com"* ]]; then
            test_pass "使用GitHub仓库"
            
            # 解析仓库信息
            if [[ $REMOTE_URL =~ github\.com[:/]([^/]+)/([^/.]+) ]]; then
                USERNAME="${BASH_REMATCH[1]}"
                REPO_NAME="${BASH_REMATCH[2]}"
                test_info "用户名: $USERNAME"
                test_info "仓库名: $REPO_NAME"
                test_info "预期访问地址: https://$USERNAME.github.io/$REPO_NAME"
            fi
        else
            test_warn "不是GitHub仓库，GitHub Pages仅支持GitHub仓库"
        fi
    else
        test_fail "未配置远程仓库"
    fi
    
    # 检查当前分支
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
    if [ "$CURRENT_BRANCH" = "main" ]; then
        test_pass "当前在main分支"
    else
        test_warn "当前分支: $CURRENT_BRANCH (建议使用main分支)"
    fi
    
else
    test_fail "不是Git仓库"
fi

echo ""
echo "📋 测试总结"
echo "============"

# 检查Node.js和npm
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    test_pass "Node.js已安装: $NODE_VERSION"
else
    test_fail "Node.js未安装"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    test_pass "npm已安装: $NPM_VERSION"
else
    test_fail "npm未安装"
fi

# 检查GitHub CLI (可选)
if command -v gh &> /dev/null; then
    GH_VERSION=$(gh --version | head -n1)
    test_pass "GitHub CLI已安装: $GH_VERSION"
else
    test_info "GitHub CLI未安装 (可选，用于更好的GitHub集成)"
fi

echo ""
echo "🚀 下一步操作建议:"
echo "=================="
echo "1. 运行部署脚本: ./deploy-github-pages.sh"
echo "2. 在GitHub仓库设置中启用Pages"
echo "3. 选择'GitHub Actions'作为部署源"
echo "4. 等待构建完成并访问网站"
echo ""
echo "🔗 相关链接:"
echo "- 仓库设置: https://github.com/$USERNAME/$REPO_NAME/settings/pages"
echo "- Actions状态: https://github.com/$USERNAME/$REPO_NAME/actions"
echo "- 预期网站: https://$USERNAME.github.io/$REPO_NAME"