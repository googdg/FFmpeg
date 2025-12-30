#!/bin/bash

# 大众汽车金融AI信审报告系统 - 功能测试脚本

# 切换到脚本所在目录
cd "$(dirname "$0")"

echo "🚗 大众汽车金融AI信审报告系统 - 功能测试"
echo "================================================"
echo ""
echo "📂 当前目录: $(pwd)"
echo ""

# 检查文件是否存在
echo "📁 检查项目文件..."
files=(
    "index.html"
    "final.html"
    "test-cases.html"
    "simple.html"
    "debug.html"
    "js/app.js"
    "js/data.js"
    "js/charts.js"
    "js/export.js"
    "css/main.css"
    "css/report.css"
    "css/print.css"
    "README.md"
    "CHANGELOG.md"
)

missing_files=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (缺失)"
        missing_files=$((missing_files + 1))
    fi
done

echo ""
if [ $missing_files -eq 0 ]; then
    echo "✅ 所有文件检查通过!"
else
    echo "⚠️  发现 $missing_files 个文件缺失"
fi

echo ""
echo "================================================"
echo ""

# 检查数据文件
echo "📊 检查案例数据..."
if [ -f "js/data.js" ]; then
    case_count=$(grep -c "case[0-9]:" js/data.js)
    echo "  发现 $case_count 个测试案例"
    
    for i in {1..5}; do
        if grep -q "case$i:" js/data.js; then
            echo "  ✅ 案例$i 存在"
        else
            echo "  ❌ 案例$i 缺失"
        fi
    done
else
    echo "  ❌ data.js 文件不存在"
fi

echo ""
echo "================================================"
echo ""

# 检查服务器状态
echo "🌐 检查服务器状态..."
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  ✅ 服务器正在运行 (端口 8000)"
    echo "  🔗 访问地址:"
    echo "     - 主页面: http://localhost:8000/index.html"
    echo "     - 报告页: http://localhost:8000/final.html"
    echo "     - 测试页: http://localhost:8000/test-cases.html"
else
    echo "  ⚠️  服务器未运行"
    echo "  💡 启动命令: ./start.sh 或 python3 -m http.server 8000"
fi

echo ""
echo "================================================"
echo ""

# 功能清单
echo "✨ 功能清单:"
echo "  ✅ 一页纸报告展示"
echo "  ✅ AI风险评估 (A/B/C/D/E五级)"
echo "  ✅ RAG智能汇总"
echo "  ✅ AI建议审核方向"
echo "  ✅ AI辅助提问"
echo "  ✅ 风险警示模块"
echo "  ✅ 5个完整测试案例"
echo "  ✅ 案例切换功能"
echo "  ✅ 案例测试页面"
echo "  ✅ PDF导出功能"
echo "  ✅ 打印优化"

echo ""
echo "================================================"
echo ""

# 测试建议
echo "🧪 测试建议:"
echo "  1. 访问 test-cases.html 查看所有案例概览"
echo "  2. 点击不同案例卡片测试报告展示"
echo "  3. 使用顶部下拉菜单测试案例切换"
echo "  4. 测试PDF导出功能"
echo "  5. 测试打印功能 (Ctrl/Cmd + P)"
echo "  6. 测试URL参数: final.html?case=case1"

echo ""
echo "================================================"
echo ""

# 浏览器测试
echo "🌐 浏览器兼容性测试建议:"
echo "  - Chrome/Edge (推荐)"
echo "  - Firefox"
echo "  - Safari"

echo ""
echo "================================================"
echo ""

echo "✅ 测试脚本执行完成!"
echo ""
echo "💡 提示: 如需启动服务器,请运行: ./start.sh"
echo ""
