#!/bin/bash
# AWS活动管理系统 - 简单测试

echo "🧪 AWS活动管理系统 - 简单功能测试"
echo "=================================="

SERVER_URL="http://localhost:3000"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo ""
echo "🔍 测试服务器连接..."
if curl -s "$SERVER_URL" > /dev/null; then
    echo -e "${GREEN}✅ 服务器连接正常${NC}"
else
    echo -e "${RED}❌ 服务器连接失败${NC}"
    exit 1
fi

echo ""
echo "🔐 测试管理员登录..."
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    "$SERVER_URL/api/auth/login")

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ 登录功能正常${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "   获取到Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}❌ 登录功能异常${NC}"
    echo "   响应: $LOGIN_RESPONSE"
    exit 1
fi

echo ""
echo "🎯 测试创建活动..."
EVENT_DATA='{"title":"测试活动","description":"测试描述","event_date":"2024-12-15","event_time":"14:00","location":"测试地点","speaker_name":"测试讲师","speaker_title":"专家","speaker_company":"测试公司","max_attendees":50}'
CREATE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$EVENT_DATA" \
    "$SERVER_URL/api/events")

if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ 创建活动功能正常${NC}"
    EVENT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "   创建的活动ID: $EVENT_ID"
else
    echo -e "${RED}❌ 创建活动功能异常${NC}"
    echo "   响应: $CREATE_RESPONSE"
    exit 1
fi

echo ""
echo "📝 测试用户报名..."
REG_DATA='{"name":"测试用户","company":"测试公司","position":"测试职位","phone":"13800138000","email":"test@test.com","notes":"测试报名"}'
REG_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
    -d "$REG_DATA" \
    "$SERVER_URL/api/events/$EVENT_ID/registrations")

if echo "$REG_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ 用户报名功能正常${NC}"
    REG_ID=$(echo "$REG_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "   报名ID: $REG_ID"
else
    echo -e "${RED}❌ 用户报名功能异常${NC}"
    echo "   响应: $REG_RESPONSE"
    exit 1
fi

echo ""
echo "✅ 测试签到功能..."
CHECKIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"checked_by":"admin"}' \
    "$SERVER_URL/api/registrations/$REG_ID/checkin")

if echo "$CHECKIN_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ 签到功能正常${NC}"
else
    echo -e "${RED}❌ 签到功能异常${NC}"
    echo "   响应: $CHECKIN_RESPONSE"
    exit 1
fi

echo ""
echo "📊 测试数据查询..."
EVENTS_RESPONSE=$(curl -s "$SERVER_URL/api/events")
REGS_RESPONSE=$(curl -s "$SERVER_URL/api/events/$EVENT_ID/registrations")

if echo "$EVENTS_RESPONSE" | grep -q '"success":true' && echo "$REGS_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ 数据查询功能正常${NC}"
    EVENT_COUNT=$(echo "$EVENTS_RESPONSE" | grep -o '"data":\[[^]]*\]' | grep -o '{"id"' | wc -l | tr -d ' ')
    REG_COUNT=$(echo "$REGS_RESPONSE" | grep -o '"data":\[[^]]*\]' | grep -o '{"id"' | wc -l | tr -d ' ')
    echo "   活动数量: $EVENT_COUNT"
    echo "   报名数量: $REG_COUNT"
else
    echo -e "${RED}❌ 数据查询功能异常${NC}"
    exit 1
fi

echo ""
echo "🎉 所有核心功能测试通过！"
echo ""
echo "✅ 系统功能验证完成："
echo "   - ✅ 服务器运行正常"
echo "   - ✅ 管理员登录正常"
echo "   - ✅ 活动创建正常"
echo "   - ✅ 用户报名正常"
echo "   - ✅ 签到功能正常"
echo "   - ✅ 数据查询正常"
echo ""
echo "💡 访问地址："
echo "   - 管理后台: http://localhost:3000"
echo "   - 报名页面: http://localhost:3000/registration.html"
echo "   - 测试页面: http://localhost:3000/quick-test.html"
echo ""