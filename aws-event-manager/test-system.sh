#!/bin/bash

# AWS活动管理系统 - 系统测试脚本

echo "🧪 AWS活动管理系统 - 系统测试"
echo "================================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "  测试: $test_name ... "
    
    if eval "$test_command" &>/dev/null; then
        echo -e "${GREEN}✅ 通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ 失败${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# 检查文件存在
check_file() {
    local file="$1"
    run_test "文件存在: $file" "[ -f '$file' ]"
}

# 检查目录存在
check_dir() {
    local dir="$1"
    run_test "目录存在: $dir" "[ -d '$dir' ]"
}

# 检查命令存在
check_command() {
    local cmd="$1"
    run_test "命令可用: $cmd" "command -v $cmd"
}

# 检查端口
check_port() {
    local port="$1"
    run_test "端口$port可用" "! lsof -Pi :$port -sTCP:LISTEN -t"
}

# HTTP请求测试
test_http() {
    local url="$1"
    local expected_status="$2"
    run_test "HTTP请求: $url" "curl -s -o /dev/null -w '%{http_code}' '$url' | grep -q '$expected_status'"
}

echo "🔍 环境检查"
echo "----------------------------------------"

# 检查Node.js环境
check_command "node"
check_command "npm"

# 检查Node.js版本
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 16 ]; then
        echo -e "  Node.js版本: ${GREEN}$(node -v) ✅${NC}"
    else
        echo -e "  Node.js版本: ${RED}$(node -v) ❌ (需要16+)${NC}"
    fi
fi

echo ""
echo "📁 文件结构检查"
echo "----------------------------------------"

# 检查核心文件
check_file "package.json"
check_file "server.js"
check_file "start.sh"
check_file ".env.example"
check_file "README.md"

# 检查前端文件
check_file "public/index.html"
check_file "public/registration.html"
check_file "public/css/main.css"
check_file "public/css/components.css"
check_file "public/js/app.js"
check_file "public/js/api-client.js"
check_file "public/js/utils.js"
check_file "public/sw.js"
check_file "public/manifest.json"

# 检查目录
check_dir "public"
check_dir "public/css"
check_dir "public/js"
check_dir "public/images"

echo ""
echo "📦 依赖检查"
echo "----------------------------------------"

# 检查package.json内容
if [ -f "package.json" ]; then
    run_test "package.json格式正确" "node -e 'JSON.parse(require(\"fs\").readFileSync(\"package.json\"))'"
    
    # 检查关键依赖
    run_test "Express依赖存在" "grep -q '\"express\"' package.json"
    run_test "SQLite依赖存在" "grep -q '\"sqlite3\"' package.json"
    run_test "JWT依赖存在" "grep -q '\"jsonwebtoken\"' package.json"
    run_test "Multer依赖存在" "grep -q '\"multer\"' package.json"
fi

echo ""
echo "🔧 配置检查"
echo "----------------------------------------"

# 检查环境变量文件
if [ -f ".env.example" ]; then
    run_test ".env.example包含JWT_SECRET" "grep -q 'JWT_SECRET' .env.example"
    run_test ".env.example包含SESSION_SECRET" "grep -q 'SESSION_SECRET' .env.example"
    run_test ".env.example包含PORT" "grep -q 'PORT' .env.example"
fi

# 检查启动脚本权限
run_test "start.sh可执行" "[ -x start.sh ]"

echo ""
echo "🌐 网络检查"
echo "----------------------------------------"

# 检查默认端口
check_port "3000"

# 如果有其他常用端口被占用，给出提示
for port in 8000 8080 3001; do
    if lsof -Pi :$port -sTCP:LISTEN -t &>/dev/null; then
        echo -e "  ${YELLOW}⚠️  端口$port已被占用${NC}"
    fi
done

echo ""
echo "📱 前端资源检查"
echo "----------------------------------------"

# 检查CSS文件内容
if [ -f "public/css/main.css" ]; then
    run_test "main.css包含CSS变量" "grep -q ':root' public/css/main.css"
    run_test "main.css包含响应式设计" "grep -q '@media' public/css/main.css"
fi

# 检查JavaScript文件
if [ -f "public/js/app.js" ]; then
    run_test "app.js包含主应用类" "grep -q 'class.*App' public/js/app.js"
fi

if [ -f "public/js/api-client.js" ]; then
    run_test "api-client.js包含API客户端" "grep -q 'class APIClient' public/js/api-client.js"
fi

echo ""
echo "🗄️ 数据库检查"
echo "----------------------------------------"

# 检查SQLite
check_command "sqlite3"

# 如果数据库文件存在，检查表结构
if [ -f "event-manager.db" ]; then
    run_test "数据库可访问" "sqlite3 event-manager.db '.tables' | grep -q 'events'"
else
    echo -e "  ${BLUE}ℹ️  数据库文件不存在，将在首次启动时创建${NC}"
fi

echo ""
echo "🔒 安全检查"
echo "----------------------------------------"

# 检查敏感文件
if [ -f ".env" ]; then
    echo -e "  ${YELLOW}⚠️  .env文件存在，请确保不要提交到版本控制${NC}"
    run_test ".env包含JWT_SECRET" "grep -q 'JWT_SECRET' .env"
else
    echo -e "  ${BLUE}ℹ️  .env文件不存在，启动时会从.env.example复制${NC}"
fi

# 检查上传目录权限
if [ -d "uploads" ]; then
    run_test "uploads目录可写" "[ -w uploads ]"
else
    echo -e "  ${BLUE}ℹ️  uploads目录不存在，启动时会自动创建${NC}"
fi

echo ""
echo "📊 性能检查"
echo "----------------------------------------"

# 检查文件大小
if [ -f "public/css/main.css" ]; then
    CSS_SIZE=$(wc -c < "public/css/main.css")
    if [ "$CSS_SIZE" -lt 100000 ]; then  # 100KB
        echo -e "  CSS文件大小: ${GREEN}${CSS_SIZE} bytes ✅${NC}"
    else
        echo -e "  CSS文件大小: ${YELLOW}${CSS_SIZE} bytes ⚠️${NC}"
    fi
fi

if [ -f "public/js/app.js" ]; then
    JS_SIZE=$(wc -c < "public/js/app.js")
    if [ "$JS_SIZE" -lt 200000 ]; then  # 200KB
        echo -e "  JS文件大小: ${GREEN}${JS_SIZE} bytes ✅${NC}"
    else
        echo -e "  JS文件大小: ${YELLOW}${JS_SIZE} bytes ⚠️${NC}"
    fi
fi

echo ""
echo "🚀 启动测试"
echo "----------------------------------------"

# 检查是否可以启动（不实际启动）
run_test "启动脚本语法正确" "bash -n start.sh"

# 如果node_modules存在，检查依赖
if [ -d "node_modules" ]; then
    run_test "依赖已安装" "[ -d node_modules ]"
    echo -e "  ${GREEN}✅ 依赖已安装，可以直接启动${NC}"
else
    echo -e "  ${YELLOW}⚠️  依赖未安装，首次启动会自动安装${NC}"
fi

echo ""
echo "================================================"
echo "📋 测试结果汇总"
echo "================================================"

echo -e "总测试数: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "通过测试: ${GREEN}$PASSED_TESTS${NC}"
echo -e "失败测试: ${RED}$FAILED_TESTS${NC}"

if [ "$FAILED_TESTS" -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 所有测试通过！系统准备就绪！${NC}"
    echo ""
    echo "🚀 现在可以启动系统："
    echo "   ./start.sh"
    echo ""
    echo "📱 启动后访问："
    echo "   管理后台: http://localhost:3000"
    echo "   报名页面: http://localhost:3000/registration.html?event=1"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}❌ 发现 $FAILED_TESTS 个问题，请检查后重试${NC}"
    echo ""
    echo "💡 常见解决方案："
    echo "   1. 安装Node.js 16+: https://nodejs.org/"
    echo "   2. 安装依赖: npm install"
    echo "   3. 设置权限: chmod +x start.sh"
    echo "   4. 检查端口占用: lsof -i :3000"
    echo ""
    exit 1
fi