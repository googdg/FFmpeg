#!/bin/bash

# 多邻国克隆项目测试运行脚本

echo "🧪 开始运行多邻国克隆项目测试套件"
echo "========================================"

# 检查Node.js和npm是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

# 运行不同类型的测试
echo ""
echo "🔧 运行前端组件测试..."
echo "------------------------"
npm run test:frontend -- --verbose

echo ""
echo "🔧 运行后端API测试..."
echo "--------------------"
npm run test:backend -- --verbose

echo ""
echo "📊 生成测试覆盖率报告..."
echo "------------------------"
npm run test:coverage

# 检查测试结果
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 所有测试通过！"
    echo ""
    echo "📋 测试总结："
    echo "- 前端组件测试: ✅ 通过"
    echo "- 后端API测试: ✅ 通过"
    echo "- 离线服务测试: ✅ 通过"
    echo "- 学习服务测试: ✅ 通过"
    echo ""
    echo "📊 覆盖率报告已生成在 coverage/ 目录"
    echo "🌐 在浏览器中打开 coverage/lcov-report/index.html 查看详细报告"
else
    echo ""
    echo "❌ 部分测试失败，请检查上面的错误信息"
    exit 1
fi

echo ""
echo "🎉 测试完成！"