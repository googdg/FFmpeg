#!/bin/bash

# 媒体转录工具 - 一键部署脚本
# 支持多平台部署：Vercel, Railway, Render, Netlify

set -e

echo "🚀 媒体转录工具 - 一键部署脚本"
echo "=================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查依赖
check_dependencies() {
    echo -e "${BLUE}📋 检查依赖...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm 未安装${NC}"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git 未安装${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 依赖检查完成${NC}"
}

# 构建项目
build_project() {
    echo -e "${BLUE}🔨 构建项目...${NC}"
    
    # 安装依赖
    echo "📦 安装根目录依赖..."
    npm install
    
    # 构建客户端
    echo "🎨 构建前端..."
    cd client
    npm install
    npm run build
    cd ..
    
    # 构建服务端
    echo "⚙️ 构建后端..."
    cd server
    npm install
    npm run build
    cd ..
    
    echo -e "${GREEN}✅ 项目构建完成${NC}"
}

# 部署到Vercel
deploy_vercel() {
    echo -e "${BLUE}🚀 部署到 Vercel...${NC}"
    
    if ! command -v vercel &> /dev/null; then
        echo "📦 安装 Vercel CLI..."
        npm install -g vercel
    fi
    
    echo "🔗 连接到 Vercel..."
    vercel --prod
    
    echo -e "${GREEN}✅ Vercel 部署完成${NC}"
}

# 部署到Railway
deploy_railway() {
    echo -e "${BLUE}🚂 部署到 Railway...${NC}"
    
    if ! command -v railway &> /dev/null; then
        echo "📦 安装 Railway CLI..."
        npm install -g @railway/cli
    fi
    
    echo "🔗 连接到 Railway..."
    railway login
    railway up
    
    echo -e "${GREEN}✅ Railway 部署完成${NC}"
}

# 部署到Netlify
deploy_netlify() {
    echo -e "${BLUE}🌐 部署到 Netlify...${NC}"
    
    if ! command -v netlify &> /dev/null; then
        echo "📦 安装 Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    echo "🔗 连接到 Netlify..."
    netlify deploy --prod --dir=client/dist
    
    echo -e "${GREEN}✅ Netlify 部署完成${NC}"
}

# Docker部署
deploy_docker() {
    echo -e "${BLUE}🐳 Docker 部署...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker 未安装${NC}"
        exit 1
    fi
    
    echo "🔨 构建 Docker 镜像..."
    docker-compose -f docker-compose.prod.yml build
    
    echo "🚀 启动服务..."
    docker-compose -f docker-compose.prod.yml up -d
    
    echo "⏳ 等待服务启动..."
    sleep 30
    
    # 健康检查
    if curl -f http://localhost/api/health; then
        echo -e "${GREEN}✅ Docker 部署成功！${NC}"
        echo -e "${GREEN}🌐 访问地址: http://localhost${NC}"
    else
        echo -e "${RED}❌ 部署失败，请检查日志${NC}"
        docker-compose -f docker-compose.prod.yml logs
    fi
}

# 推送到GitHub
push_to_github() {
    echo -e "${BLUE}📤 推送到 GitHub...${NC}"
    
    git add .
    git commit -m "feat: 添加多平台部署配置

🚀 新增部署方案:
- Railway: railway.toml
- Netlify: netlify.toml  
- Render: render.yaml
- Docker生产环境: docker-compose.prod.yml
- 一键部署脚本: deploy-all.sh

📦 优化内容:
- 多阶段Docker构建
- 生产环境配置
- 健康检查和监控
- 自动化部署流程"
    
    git push origin main
    
    echo -e "${GREEN}✅ 代码推送完成${NC}"
}

# 显示菜单
show_menu() {
    echo ""
    echo -e "${YELLOW}请选择部署方案:${NC}"
    echo "1) 🌐 Vercel (推荐 - 全栈)"
    echo "2) 🚂 Railway (推荐 - 完整功能)"
    echo "3) 📄 Netlify (静态站点)"
    echo "4) 🎨 Render (全栈)"
    echo "5) 🐳 Docker (本地/服务器)"
    echo "6) 📤 推送到GitHub"
    echo "7) 🔨 仅构建项目"
    echo "8) 🚀 全部部署"
    echo "0) 退出"
    echo ""
}

# 主函数
main() {
    check_dependencies
    
    while true; do
        show_menu
        read -p "请输入选择 (0-8): " choice
        
        case $choice in
            1)
                build_project
                deploy_vercel
                ;;
            2)
                build_project
                deploy_railway
                ;;
            3)
                build_project
                deploy_netlify
                ;;
            4)
                build_project
                echo -e "${YELLOW}⚠️ 请手动在 Render 网站上导入 GitHub 仓库${NC}"
                echo -e "${BLUE}📖 访问: https://render.com/new${NC}"
                ;;
            5)
                build_project
                deploy_docker
                ;;
            6)
                push_to_github
                ;;
            7)
                build_project
                ;;
            8)
                build_project
                push_to_github
                echo -e "${YELLOW}🌟 开始全平台部署...${NC}"
                deploy_vercel
                deploy_railway
                deploy_netlify
                echo -e "${GREEN}🎉 全部部署完成！${NC}"
                ;;
            0)
                echo -e "${GREEN}👋 再见！${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ 无效选择，请重试${NC}"
                ;;
        esac
        
        echo ""
        read -p "按回车键继续..."
    done
}

# 运行主函数
main