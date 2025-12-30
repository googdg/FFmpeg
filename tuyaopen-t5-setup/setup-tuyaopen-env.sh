#!/bin/bash

# TuyaOpen T5 AI 硬件开发环境自动配置脚本
# 支持 macOS 和 Linux 系统

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# 检测操作系统
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        print_message "检测到 macOS 系统"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        print_message "检测到 Linux 系统"
    else
        print_error "不支持的操作系统: $OSTYPE"
        print_error "请使用 macOS 或 Linux 系统"
        exit 1
    fi
}

# 检查必需的命令
check_command() {
    if command -v "$1" &> /dev/null; then
        print_message "$1 已安装"
        return 0
    else
        print_warning "$1 未安装"
        return 1
    fi
}

# 安装 macOS 依赖
install_macos_deps() {
    print_step "安装 macOS 开发依赖..."
    
    # 检查并安装 Homebrew
    if ! check_command "brew"; then
        print_message "安装 Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # 添加 Homebrew 到 PATH
        if [[ -f "/opt/homebrew/bin/brew" ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
    fi
    
    # 更新 Homebrew
    brew update
    
    # 安装开发工具
    local tools=("git" "python3" "node" "cmake" "wget" "curl")
    for tool in "${tools[@]}"; do
        if ! check_command "$tool"; then
            print_message "安装 $tool..."
            brew install "$tool"
        fi
    done
    
    # 安装串口工具
    if ! check_command "minicom"; then
        print_message "安装串口调试工具..."
        brew install minicom
    fi
    
    # 安装 VS Code (可选)
    if ! check_command "code"; then
        print_message "安装 Visual Studio Code..."
        brew install --cask visual-studio-code
    fi
}

# 安装 Linux 依赖
install_linux_deps() {
    print_step "安装 Linux 开发依赖..."
    
    # 更新包管理器
    if command -v apt &> /dev/null; then
        sudo apt update
        
        # 安装基础工具
        sudo apt install -y git python3 python3-pip nodejs npm cmake \
                           build-essential wget curl minicom screen \
                           libusb-1.0-0-dev pkg-config
    elif command -v yum &> /dev/null; then
        sudo yum update -y
        sudo yum install -y git python3 python3-pip nodejs npm cmake \
                           gcc gcc-c++ make wget curl minicom screen \
                           libusb-devel pkgconfig
    else
        print_error "不支持的 Linux 发行版"
        exit 1
    fi
}

# 安装 Python 依赖
install_python_deps() {
    print_step "安装 Python 依赖包..."
    
    # 升级 pip
    python3 -m pip install --upgrade pip
    
    # 安装常用的 IoT 开发包
    local packages=(
        "pyserial"
        "requests"
        "paho-mqtt"
        "cryptography"
        "click"
        "colorama"
        "tqdm"
        "esptool"
    )
    
    for package in "${packages[@]}"; do
        print_message "安装 Python 包: $package"
        python3 -m pip install "$package"
    done
}

# 安装 Node.js 依赖
install_nodejs_deps() {
    print_step "安装 Node.js 全局包..."
    
    local packages=(
        "serialport"
        "mqtt"
    )
    
    for package in "${packages[@]}"; do
        if ! npm list -g "$package" &> /dev/null; then
            print_message "安装 Node.js 包: $package"
            npm install -g "$package"
        fi
    done
}

# 克隆 TuyaOpen 仓库
clone_tuyaopen() {
    print_step "克隆 TuyaOpen 仓库..."
    
    if [[ ! -d "TuyaOpen" ]]; then
        print_message "克隆 TuyaOpen 主仓库..."
        git clone https://github.com/tuya/TuyaOpen.git
    else
        print_message "TuyaOpen 仓库已存在，更新中..."
        cd TuyaOpen
        git pull origin main || git pull origin master
        cd ..
    fi
    
    # 克隆示例仓库
    if [[ ! -d "tuya-iot-device-sdk-embedded-c" ]]; then
        print_message "克隆 TuyaOpen SDK 示例..."
        git clone https://github.com/tuya/tuya-iot-device-sdk-embedded-c.git
    fi
}

# 创建项目结构
create_project_structure() {
    print_step "创建项目目录结构..."
    
    local dirs=(
        "config"
        "src"
        "tools"
        "docs"
        "examples/hello_world"
        "examples/ai_demo"
        "examples/iot_demo"
        "build"
        "logs"
    )
    
    for dir in "${dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            mkdir -p "$dir"
            print_message "创建目录: $dir"
        fi
    done
}

# 创建配置文件
create_config_files() {
    print_step "创建配置文件..."
    
    # 创建涂鸦平台配置文件
    cat > config/tuya_config.json << 'EOF'
{
    "app_id": "your_app_id_here",
    "app_secret": "your_app_secret_here",
    "region": "cn",
    "device_id": "your_device_id_here",
    "device_secret": "your_device_secret_here",
    "product_id": "your_product_id_here"
}
EOF
    
    # 创建设备配置头文件
    cat > config/device_config.h << 'EOF'
#ifndef DEVICE_CONFIG_H
#define DEVICE_CONFIG_H

// 设备基本信息
#define DEVICE_NAME "T5_AI_Demo"
#define DEVICE_VERSION "1.0.0"
#define FIRMWARE_VERSION "1.0.0"

// WiFi 配置
#define WIFI_SSID "your_wifi_ssid"
#define WIFI_PASSWORD "your_wifi_password"

// 串口配置
#define UART_BAUDRATE 115200
#define UART_DATA_BITS 8
#define UART_STOP_BITS 1
#define UART_PARITY 0

// AI 功能配置
#define AI_MODEL_PATH "/model/ai_model.bin"
#define AI_INPUT_SIZE 224
#define AI_OUTPUT_SIZE 1000

// IoT 功能配置
#define MQTT_KEEPALIVE 60
#define MQTT_QOS 1

#endif // DEVICE_CONFIG_H
EOF
    
    print_message "配置文件已创建，请根据实际情况修改"
}

# 创建开发工具
create_dev_tools() {
    print_step "创建开发工具..."
    
    # 创建烧录工具
    cat > tools/flash_tool.py << 'EOF'
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TuyaOpen T5 AI 开发板烧录工具
"""

import argparse
import serial
import time
import sys
from pathlib import Path

def flash_firmware(port, baudrate, firmware_path):
    """烧录固件到设备"""
    try:
        print(f"连接到串口: {port}")
        ser = serial.Serial(port, baudrate, timeout=1)
        
        print(f"读取固件文件: {firmware_path}")
        with open(firmware_path, 'rb') as f:
            firmware_data = f.read()
        
        print(f"开始烧录固件 ({len(firmware_data)} 字节)...")
        
        # 这里应该实现具体的烧录协议
        # 目前只是示例代码
        ser.write(firmware_data)
        
        print("烧录完成！")
        ser.close()
        
    except Exception as e:
        print(f"烧录失败: {e}")
        return False
    
    return True

def main():
    parser = argparse.ArgumentParser(description='TuyaOpen T5 AI 烧录工具')
    parser.add_argument('--port', required=True, help='串口设备路径')
    parser.add_argument('--baudrate', type=int, default=115200, help='波特率')
    parser.add_argument('--firmware', required=True, help='固件文件路径')
    
    args = parser.parse_args()
    
    if not Path(args.firmware).exists():
        print(f"固件文件不存在: {args.firmware}")
        sys.exit(1)
    
    success = flash_firmware(args.port, args.baudrate, args.firmware)
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
EOF
    
    # 创建串口监控工具
    cat > tools/serial_monitor.py << 'EOF'
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TuyaOpen T5 AI 串口监控工具
"""

import argparse
import serial
import time
import sys
from datetime import datetime

def monitor_serial(port, baudrate, log_file=None):
    """监控串口输出"""
    try:
        print(f"连接到串口: {port} (波特率: {baudrate})")
        ser = serial.Serial(port, baudrate, timeout=1)
        
        log_handle = None
        if log_file:
            log_handle = open(log_file, 'a', encoding='utf-8')
            print(f"日志将保存到: {log_file}")
        
        print("开始监控串口输出 (按 Ctrl+C 退出)...")
        print("-" * 50)
        
        while True:
            if ser.in_waiting > 0:
                data = ser.readline().decode('utf-8', errors='ignore').strip()
                if data:
                    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    output = f"[{timestamp}] {data}"
                    print(output)
                    
                    if log_handle:
                        log_handle.write(output + '\n')
                        log_handle.flush()
            
            time.sleep(0.01)
            
    except KeyboardInterrupt:
        print("\n监控已停止")
    except Exception as e:
        print(f"监控失败: {e}")
    finally:
        if 'ser' in locals():
            ser.close()
        if log_handle:
            log_handle.close()

def main():
    parser = argparse.ArgumentParser(description='TuyaOpen T5 AI 串口监控工具')
    parser.add_argument('--port', required=True, help='串口设备路径')
    parser.add_argument('--baudrate', type=int, default=115200, help='波特率')
    parser.add_argument('--log', help='日志文件路径')
    
    args = parser.parse_args()
    
    monitor_serial(args.port, args.baudrate, args.log)

if __name__ == '__main__':
    main()
EOF
    
    # 给工具脚本执行权限
    chmod +x tools/flash_tool.py
    chmod +x tools/serial_monitor.py
    
    print_message "开发工具已创建"
}

# 创建示例代码
create_examples() {
    print_step "创建示例代码..."
    
    # Hello World 示例
    cat > examples/hello_world/main.c << 'EOF'
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include "../../config/device_config.h"

// 模拟涂鸦 IoT 结构体和函数
typedef enum {
    TUYA_IOT_STATUS_DISCONNECTED = 0,
    TUYA_IOT_STATUS_CONNECTED = 1,
    TUYA_IOT_STATUS_ERROR = -1
} tuya_iot_status_t;

typedef struct {
    const char* software_ver;
    const char* productkey;
    const char* uuid;
    const char* authkey;
} tuya_iot_config_t;

// 设备信息
static tuya_iot_config_t g_tuya_config = {
    .software_ver = FIRMWARE_VERSION,
    .productkey = "your_product_key",
    .uuid = "your_device_uuid",
    .authkey = "your_device_authkey"
};

// 设备状态回调
void device_status_callback(tuya_iot_status_t status) {
    printf("Device status changed: %d\n", status);
}

// 数据点回调
void datapoint_callback(const char* dps) {
    printf("Received datapoint: %s\n", dps);
}

// 模拟涂鸦 IoT 函数
int tuya_iot_init(tuya_iot_config_t* config) {
    printf("Initializing Tuya IoT with version: %s\n", config->software_ver);
    return 0;
}

void tuya_iot_register_status_callback(void (*callback)(tuya_iot_status_t)) {
    printf("Status callback registered\n");
}

void tuya_iot_register_dp_callback(void (*callback)(const char*)) {
    printf("Datapoint callback registered\n");
}

int tuya_iot_start() {
    printf("Starting Tuya IoT service...\n");
    return 0;
}

void tuya_iot_yield() {
    // 模拟处理 IoT 事件
    static int counter = 0;
    if (counter++ % 100000 == 0) {
        printf("Processing IoT events...\n");
    }
}

int main() {
    printf("=== TuyaOpen T5 AI Hello World Demo ===\n");
    printf("Device: %s\n", DEVICE_NAME);
    printf("Version: %s\n", DEVICE_VERSION);
    printf("Firmware: %s\n", FIRMWARE_VERSION);
    printf("=====================================\n\n");
    
    // 初始化涂鸦 IoT SDK
    if (tuya_iot_init(&g_tuya_config) != 0) {
        printf("Failed to initialize Tuya IoT\n");
        return -1;
    }
    
    // 注册回调函数
    tuya_iot_register_status_callback(device_status_callback);
    tuya_iot_register_dp_callback(datapoint_callback);
    
    // 启动 IoT 服务
    if (tuya_iot_start() != 0) {
        printf("Failed to start Tuya IoT service\n");
        return -1;
    }
    
    printf("T5 AI Demo started successfully!\n");
    printf("Press Ctrl+C to exit...\n\n");
    
    // 主循环
    int loop_count = 0;
    while (1) {
        printf("[%d] Hello from T5 AI! Status: Running\n", ++loop_count);
        
        // 处理 IoT 事件
        tuya_iot_yield();
        
        // 延时 5 秒
        sleep(5);
        
        // 演示用，运行 10 次后退出
        if (loop_count >= 10) {
            printf("\nDemo completed after %d iterations\n", loop_count);
            break;
        }
    }
    
    printf("T5 AI Demo finished\n");
    return 0;
}
EOF
    
    # 创建 Makefile
    cat > examples/hello_world/Makefile << 'EOF'
# TuyaOpen T5 AI Hello World Makefile

CC = gcc
CFLAGS = -Wall -Wextra -std=c99 -I../../config
LDFLAGS = 

TARGET = hello_world
SOURCES = main.c
OBJECTS = $(SOURCES:.c=.o)

.PHONY: all clean run flash monitor

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CC) $(OBJECTS) -o $(TARGET) $(LDFLAGS)
	@echo "Build completed: $(TARGET)"

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJECTS) $(TARGET)
	@echo "Clean completed"

run: $(TARGET)
	@echo "Running $(TARGET)..."
	./$(TARGET)

flash: $(TARGET)
	@echo "Flashing $(TARGET) to device..."
	../../tools/flash_tool.py --port /dev/ttyUSB0 --firmware $(TARGET)

monitor:
	@echo "Starting serial monitor..."
	../../tools/serial_monitor.py --port /dev/ttyUSB0 --log ../../logs/serial.log

help:
	@echo "Available targets:"
	@echo "  all     - Build the project"
	@echo "  clean   - Clean build files"
	@echo "  run     - Run the executable locally"
	@echo "  flash   - Flash firmware to device"
	@echo "  monitor - Start serial monitor"
	@echo "  help    - Show this help message"
EOF
    
    print_message "示例代码已创建"
}

# 设置环境变量
setup_environment() {
    print_step "设置环境变量..."
    
    # 创建环境变量配置文件
    cat > .env << 'EOF'
# TuyaOpen T5 AI 开发环境变量

# 涂鸦平台配置
export TUYA_APP_ID="your_app_id_here"
export TUYA_APP_SECRET="your_app_secret_here"
export TUYA_REGION="cn"

# 设备配置
export TUYA_DEVICE_ID="your_device_id_here"
export TUYA_DEVICE_SECRET="your_device_secret_here"
export TUYA_PRODUCT_ID="your_product_id_here"

# 开发工具路径
export TUYA_SDK_PATH="$(pwd)/TuyaOpen"
export TUYA_TOOLS_PATH="$(pwd)/tools"

# 串口配置
export SERIAL_PORT="/dev/ttyUSB0"
export SERIAL_BAUDRATE="115200"

# 构建配置
export BUILD_TYPE="debug"
export TARGET_PLATFORM="t5ai"
EOF
    
    # 添加到 shell 配置文件
    local shell_config=""
    if [[ -f "$HOME/.zshrc" ]]; then
        shell_config="$HOME/.zshrc"
    elif [[ -f "$HOME/.bashrc" ]]; then
        shell_config="$HOME/.bashrc"
    fi
    
    if [[ -n "$shell_config" ]]; then
        echo "" >> "$shell_config"
        echo "# TuyaOpen T5 AI 开发环境" >> "$shell_config"
        echo "source $(pwd)/.env" >> "$shell_config"
        print_message "环境变量已添加到 $shell_config"
    fi
}

# 验证安装
verify_installation() {
    print_step "验证安装..."
    
    local errors=0
    
    # 检查基础工具
    local tools=("git" "python3" "node" "cmake")
    for tool in "${tools[@]}"; do
        if check_command "$tool"; then
            local version
            case $tool in
                "git") version=$(git --version) ;;
                "python3") version=$(python3 --version) ;;
                "node") version=$(node --version) ;;
                "cmake") version=$(cmake --version | head -n1) ;;
            esac
            print_message "$tool: $version"
        else
            print_error "$tool 未正确安装"
            ((errors++))
        fi
    done
    
    # 检查 Python 包
    local python_packages=("serial" "requests")
    for package in "${python_packages[@]}"; do
        if python3 -c "import $package" 2>/dev/null; then
            print_message "Python 包 $package: 已安装"
        else
            print_warning "Python 包 $package: 未安装"
        fi
    done
    
    # 检查项目结构
    local dirs=("config" "src" "tools" "examples")
    for dir in "${dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            print_message "目录 $dir: 存在"
        else
            print_error "目录 $dir: 不存在"
            ((errors++))
        fi
    done
    
    # 检查 TuyaOpen 仓库
    if [[ -d "TuyaOpen" ]]; then
        print_message "TuyaOpen 仓库: 已克隆"
    else
        print_error "TuyaOpen 仓库: 未找到"
        ((errors++))
    fi
    
    # 编译测试
    print_message "编译测试示例..."
    cd examples/hello_world
    if make clean && make; then
        print_success "示例编译成功"
    else
        print_error "示例编译失败"
        ((errors++))
    fi
    cd ../..
    
    if [[ $errors -eq 0 ]]; then
        print_success "所有验证通过！环境配置成功"
    else
        print_error "发现 $errors 个问题，请检查上述错误"
        return 1
    fi
}

# 显示使用说明
show_usage() {
    print_step "环境配置完成！"
    echo ""
    echo "🎉 TuyaOpen T5 AI 开发环境已成功配置"
    echo ""
    echo "📋 下一步操作："
    echo "1. 编辑配置文件："
    echo "   - config/tuya_config.json (涂鸦平台配置)"
    echo "   - config/device_config.h (设备配置)"
    echo "   - .env (环境变量)"
    echo ""
    echo "2. 编译示例项目："
    echo "   cd examples/hello_world"
    echo "   make"
    echo "   make run"
    echo ""
    echo "3. 连接开发板："
    echo "   - 连接 T5 AI 开发板到 USB 端口"
    echo "   - 运行: make monitor"
    echo ""
    echo "4. 烧录固件："
    echo "   make flash"
    echo ""
    echo "📚 更多信息请查看："
    echo "   - README.md"
    echo "   - docs/ 目录"
    echo "   - TuyaOpen/ 目录中的官方文档"
    echo ""
    echo "🆘 如遇问题，请检查："
    echo "   - 串口设备路径 (通常是 /dev/ttyUSB* 或 /dev/tty.usbserial-*)"
    echo "   - 设备驱动是否正确安装"
    echo "   - 网络连接是否正常"
    echo ""
}

# 主函数
main() {
    echo "🚀 TuyaOpen T5 AI 开发环境自动配置脚本"
    echo "================================================"
    echo ""
    
    # 检测操作系统
    detect_os
    
    # 安装依赖
    if [[ "$OS" == "macos" ]]; then
        install_macos_deps
    else
        install_linux_deps
    fi
    
    # 安装 Python 和 Node.js 依赖
    install_python_deps
    install_nodejs_deps
    
    # 克隆 TuyaOpen 仓库
    clone_tuyaopen
    
    # 创建项目结构
    create_project_structure
    
    # 创建配置文件
    create_config_files
    
    # 创建开发工具
    create_dev_tools
    
    # 创建示例代码
    create_examples
    
    # 设置环境变量
    setup_environment
    
    # 验证安装
    if verify_installation; then
        show_usage
    else
        print_error "环境配置过程中出现错误，请检查上述信息"
        exit 1
    fi
    
    print_success "TuyaOpen T5 AI 开发环境配置完成！"
}

# 运行主函数
main "$@"