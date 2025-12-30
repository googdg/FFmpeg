#!/bin/bash

# TuyaOpen T5 AI 环境验证脚本
# 用于验证开发环境是否正确配置

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 计数器
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# 打印函数
print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_pass() {
    echo -e "${GREEN}✅ PASS${NC} $1"
    ((PASS_COUNT++))
}

print_fail() {
    echo -e "${RED}❌ FAIL${NC} $1"
    ((FAIL_COUNT++))
}

print_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC} $1"
    ((WARN_COUNT++))
}

print_info() {
    echo -e "${BLUE}ℹ️  INFO${NC} $1"
}

# 检查命令是否存在
check_command() {
    local cmd=$1
    local name=${2:-$cmd}
    
    if command -v "$cmd" &> /dev/null; then
        local version
        case $cmd in
            "git") version=$(git --version 2>/dev/null | cut -d' ' -f3) ;;
            "python3") version=$(python3 --version 2>/dev/null | cut -d' ' -f2) ;;
            "node") version=$(node --version 2>/dev/null) ;;
            "npm") version=$(npm --version 2>/dev/null) ;;
            "cmake") version=$(cmake --version 2>/dev/null | head -n1 | cut -d' ' -f3) ;;
            "make") version=$(make --version 2>/dev/null | head -n1 | cut -d' ' -f3) ;;
            "gcc") version=$(gcc --version 2>/dev/null | head -n1 | cut -d' ' -f4) ;;
            *) version="已安装" ;;
        esac
        print_pass "$name ($version)"
        return 0
    else
        print_fail "$name 未安装"
        return 1
    fi
}

# 检查 Python 包
check_python_package() {
    local package=$1
    if python3 -c "import $package" 2>/dev/null; then
        local version=$(python3 -c "import $package; print(getattr($package, '__version__', 'unknown'))" 2>/dev/null)
        print_pass "Python $package ($version)"
        return 0
    else
        print_fail "Python $package 未安装"
        return 1
    fi
}

# 检查目录
check_directory() {
    local dir=$1
    local name=${2:-$dir}
    
    if [[ -d "$dir" ]]; then
        print_pass "目录 $name 存在"
        return 0
    else
        print_fail "目录 $name 不存在"
        return 1
    fi
}

# 检查文件
check_file() {
    local file=$1
    local name=${2:-$file}
    
    if [[ -f "$file" ]]; then
        print_pass "文件 $name 存在"
        return 0
    else
        print_fail "文件 $name 不存在"
        return 1
    fi
}

# 检查文件权限
check_executable() {
    local file=$1
    local name=${2:-$file}
    
    if [[ -x "$file" ]]; then
        print_pass "$name 可执行"
        return 0
    else
        print_fail "$name 不可执行"
        return 1
    fi
}

# 检查网络连接
check_network() {
    local host=$1
    local name=${2:-$host}
    
    if ping -c 1 -W 3 "$host" &> /dev/null; then
        print_pass "网络连接 $name"
        return 0
    else
        print_warn "网络连接 $name 失败 (可能是网络问题)"
        return 1
    fi
}

# 检查串口设备
check_serial_devices() {
    local devices
    
    # 检查不同类型的串口设备
    devices=$(ls /dev/tty* 2>/dev/null | grep -E "(USB|ACM|usbserial)" | head -5)
    
    if [[ -n "$devices" ]]; then
        print_pass "找到串口设备:"
        echo "$devices" | while read -r device; do
            print_info "  - $device"
        done
        return 0
    else
        print_warn "未找到串口设备 (开发板可能未连接)"
        return 1
    fi
}

# 编译测试
test_compilation() {
    local test_dir="examples/hello_world"
    
    if [[ -d "$test_dir" ]]; then
        print_info "测试编译 $test_dir..."
        
        cd "$test_dir"
        
        # 清理之前的编译
        if make clean &> /dev/null; then
            print_pass "清理编译文件成功"
        else
            print_warn "清理编译文件失败"
        fi
        
        # 编译项目
        if make &> /dev/null; then
            print_pass "编译测试项目成功"
            
            # 检查生成的可执行文件
            if [[ -f "hello_world" ]]; then
                print_pass "生成可执行文件"
                
                # 测试运行 (限时 5 秒)
                if timeout 5s ./hello_world &> /dev/null; then
                    print_pass "运行测试成功"
                else
                    print_warn "运行测试超时或失败"
                fi
            else
                print_fail "未生成可执行文件"
            fi
        else
            print_fail "编译测试项目失败"
        fi
        
        cd - > /dev/null
        return 0
    else
        print_fail "测试项目目录不存在"
        return 1
    fi
}

# 主验证函数
main() {
    echo "🔍 TuyaOpen T5 AI 开发环境验证"
    echo "================================"
    echo ""
    
    # 1. 系统信息
    print_header "系统信息"
    print_info "操作系统: $(uname -s) $(uname -r)"
    print_info "架构: $(uname -m)"
    print_info "当前用户: $(whoami)"
    print_info "当前目录: $(pwd)"
    echo ""
    
    # 2. 基础工具检查
    print_header "基础开发工具"
    check_command "git" "Git"
    check_command "python3" "Python3"
    check_command "node" "Node.js"
    check_command "npm" "NPM"
    check_command "cmake" "CMake"
    check_command "make" "Make"
    check_command "gcc" "GCC"
    echo ""
    
    # 3. 可选工具检查
    print_header "可选开发工具"
    check_command "minicom" "Minicom (串口工具)"
    check_command "screen" "Screen (串口工具)"
    check_command "code" "VS Code"
    check_command "esptool.py" "ESPTool (烧录工具)"
    echo ""
    
    # 4. Python 包检查
    print_header "Python 依赖包"
    check_python_package "serial"
    check_python_package "requests"
    check_python_package "paho.mqtt"
    check_python_package "cryptography"
    echo ""
    
    # 5. 项目结构检查
    print_header "项目结构"
    check_directory "TuyaOpen" "TuyaOpen 主仓库"
    check_directory "config" "配置目录"
    check_directory "tools" "工具目录"
    check_directory "examples" "示例目录"
    check_directory "examples/hello_world" "Hello World 示例"
    echo ""
    
    # 6. 配置文件检查
    print_header "配置文件"
    check_file "config/tuya_config.json" "涂鸦配置文件"
    check_file "config/device_config.h" "设备配置文件"
    check_file ".env" "环境变量文件"
    echo ""
    
    # 7. 工具脚本检查
    print_header "开发工具脚本"
    check_file "tools/flash_tool.py" "烧录工具"
    check_file "tools/serial_monitor.py" "串口监控工具"
    check_executable "tools/flash_tool.py" "烧录工具权限"
    check_executable "tools/serial_monitor.py" "串口监控工具权限"
    echo ""
    
    # 8. 网络连接检查
    print_header "网络连接"
    check_network "github.com" "GitHub"
    check_network "iot.tuya.com" "涂鸦 IoT 平台"
    check_network "8.8.8.8" "互联网连接"
    echo ""
    
    # 9. 硬件设备检查
    print_header "硬件设备"
    check_serial_devices
    echo ""
    
    # 10. 编译测试
    print_header "编译测试"
    test_compilation
    echo ""
    
    # 11. 环境变量检查
    print_header "环境变量"
    if [[ -n "$TUYA_SDK_PATH" ]]; then
        print_pass "TUYA_SDK_PATH 已设置: $TUYA_SDK_PATH"
    else
        print_warn "TUYA_SDK_PATH 未设置"
    fi
    
    if [[ -n "$TUYA_APP_ID" ]]; then
        print_pass "TUYA_APP_ID 已设置"
    else
        print_warn "TUYA_APP_ID 未设置 (需要配置涂鸦平台信息)"
    fi
    echo ""
    
    # 12. 总结报告
    print_header "验证总结"
    echo "通过: $PASS_COUNT 项"
    echo "失败: $FAIL_COUNT 项"
    echo "警告: $WARN_COUNT 项"
    echo ""
    
    if [[ $FAIL_COUNT -eq 0 ]]; then
        echo -e "${GREEN}🎉 环境验证通过！可以开始开发了。${NC}"
        
        if [[ $WARN_COUNT -gt 0 ]]; then
            echo -e "${YELLOW}⚠️  有 $WARN_COUNT 个警告项，建议检查但不影响基本开发。${NC}"
        fi
        
        echo ""
        echo "📋 下一步建议："
        echo "1. 连接 T5 AI 开发板"
        echo "2. 配置涂鸦平台信息 (config/tuya_config.json)"
        echo "3. 编译并烧录示例项目"
        echo "4. 开始你的 IoT 开发之旅！"
        
        return 0
    else
        echo -e "${RED}❌ 环境验证失败，发现 $FAIL_COUNT 个问题。${NC}"
        echo ""
        echo "🔧 建议解决方案："
        echo "1. 重新运行安装脚本: ./setup-tuyaopen-env.sh"
        echo "2. 查看故障排除指南: TROUBLESHOOTING.md"
        echo "3. 手动安装缺失的工具和依赖"
        
        return 1
    fi
}

# 运行验证
main "$@"