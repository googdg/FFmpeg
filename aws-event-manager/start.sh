#!/bin/bash

# AWS开发者社区活动管理系统 - 启动脚本

echo "🚀 启动AWS开发者社区活动管理系统..."
echo "================================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js 16+"
    exit 1
fi

# 检查Node.js版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js版本过低，需要16+，当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装"
    exit 1
fi

echo "✅ npm版本: $(npm -v)"

# 创建必要的目录
echo "📁 创建必要目录..."
mkdir -p uploads
mkdir -p logs

# 检查是否存在package.json
if [ ! -f "package.json" ]; then
    echo "❌ package.json不存在"
    exit 1
fi

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖包..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚙️  创建环境变量文件..."
    cp .env.example .env
    echo "✅ 已创建.env文件，请根据需要修改配置"
fi

# 检查数据库文件
if [ ! -f "event-manager.db" ]; then
    echo "🗄️  数据库将在首次启动时自动创建"
fi

# 设置权限
chmod +x start.sh 2>/dev/null || true

echo ""
echo "================================================"
echo "🎉 准备工作完成！"
echo ""
echo "📋 系统信息:"
echo "   - 项目名称: AWS开发者社区活动管理系统"
echo "   - 版本: 1.0.0"
echo "   - Node.js: $(node -v)"
echo "   - 端口: ${PORT:-3000}"
echo ""
echo "🔑 默认管理员账户:"
echo "   - 用户名: admin"
echo "   - 密码: admin123"
echo ""
echo "🌐 访问地址:"
echo "   - 管理后台: http://localhost:${PORT:-3000}"
echo "   - 报名页面: http://localhost:${PORT:-3000}/registration.html?event=1"
echo ""
echo "================================================"
echo ""

# 启动应用
echo "🚀 启动应用服务器..."

# 检查是否在开发环境
if [ "$NODE_ENV" = "production" ]; then
    echo "🏭 生产环境模式"
    npm start
else
    echo "🔧 开发环境模式"
    
    # 检查是否安装了nodemon
    if command -v nodemon &> /dev/null; then
        npm run dev
    else
        echo "⚠️  nodemon未安装，使用普通模式启动"
        npm start
    fi
fi