#!/bin/bash

# 多邻国克隆项目开发环境启动脚本

echo "🚀 启动多邻国克隆项目开发环境..."

# 检查 Node.js 版本
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 检查 npm 版本
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✅ npm 版本: $(npm --version)"

# 安装前端依赖
echo "📦 安装前端依赖..."
npm install

# 安装后端依赖
echo "📦 安装后端依赖..."
cd server
npm install
cd ..

# 启动后端服务器
echo "🔧 启动后端服务器..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# 等待后端启动
echo "⏳ 等待后端服务器启动..."
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ 后端服务器启动成功 (http://localhost:3001)"
else
    echo "❌ 后端服务器启动失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 启动前端服务器
echo "🎨 启动前端服务器..."
npm run dev -- --port 1029 &
FRONTEND_PID=$!

# 等待前端启动
echo "⏳ 等待前端服务器启动..."
sleep 3

# 检查前端是否启动成功
if curl -s http://localhost:1029 > /dev/null; then
    echo "✅ 前端服务器启动成功 (http://localhost:1029)"
else
    echo "❌ 前端服务器启动失败"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 多邻国克隆项目启动成功！"
echo ""
echo "📱 前端地址: http://localhost:1029"
echo "🔧 后端地址: http://localhost:3001"
echo "💚 健康检查: http://localhost:3001/health"
echo "📚 API文档: http://localhost:3001/api"
echo ""
echo "🛑 要停止服务器，请按 Ctrl+C"

# 等待用户中断
trap 'echo ""; echo "🛑 正在停止服务器..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "✅ 服务器已停止"; exit 0' INT

# 保持脚本运行
wait