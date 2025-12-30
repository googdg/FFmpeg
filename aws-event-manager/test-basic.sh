#!/bin/bash
# AWS活动管理系统 - 基础功能测试

echo "🧪 AWS活动管理系统 - 基础功能测试"
echo "=================================="

# 服务器地址
SERVER_URL="http://localhost:3000"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 测试计数
TOTAL=0
PASSED=0

# 测试函数
test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected="$5"
    
    TOTAL=$((TOTAL + 1))
    echo -n "测试 $name ... "
    
    if [ "$method" = "GET" ]; then
        status_code=$(curl -s -o /dev/null -w "%{http_code}" "$SERVER_URL$endpoint")
    else
        status_code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$SERVER_URL$endpoint")
    fi
    
    if [ "$status_code" -eq "$expected" ]; then
        echo -e "${GREEN}✅ 通过${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ 失败 (状态码: $status_code)${NC}"
        return 1
    fi
}

echo ""
echo "🔍 1. 基础连接测试"
echo "-------------------"
test_api "服务器响应" "GET" "/" "200"
test_api "管理后台页面" "GET" "/index.html" "200"
test_api "报名页面" "GET" "/registration.html" "200"

echo ""
echo "🎨 2. 静态资源测试"
echo "-------------------"
test_api "主样式文件" "GET" "/css/main.css" "200"
test_api "组件样式文件" "GET" "/css/components.css" "200"
test_api "主应用JS" "GET" "/js/app.js" "200"
test_api "API客户端JS" "GET" "/js/api-client.js" "200"

echo ""
echo "🔐 3. API端点测试"
echo "-------------------"
test_api "获取活动列表" "GET" "/api/events" "200"
test_api "登录API" "POST" "/api/auth/login" '{"username":"admin","password":"admin123"}' "200"

echo ""
echo "📋 测试结果汇总"
echo "================"
echo -e "总测试数: ${BLUE}$TOTAL${NC}"
echo -e "通过测试: ${GREEN}$PASSED${NC}"
echo -e "失败测试: ${RED}$((TOTAL - PASSED))${NC}"

if [ $PASSED -eq $TOTAL ]; then
    echo ""
    echo -e "${GREEN}🎉 所有基础测试通过！${NC}"
    echo ""
    echo "✅ 系统基础功能正常："
    echo "   - 服务器运行正常"
    echo "   - 页面可以访问"
    echo "   - 静态资源加载正常"
    echo "   - API端点响应正常"
    echo ""
    echo "💡 建议："
    echo "   - 访问 http://localhost:3000/quick-test.html 进行完整功能测试"
    echo "   - 访问 http://localhost:3000 进入管理后台"
    echo "   - 访问 http://localhost:3000/registration.html 测试报名功能"
    exit 0
else
    echo ""
    echo -e "${RED}❌ 发现问题，需要检查系统配置${NC}"
    exit 1
fi