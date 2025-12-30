# 🚀 TuyaOpen T5 AI 快速开始指南

## 一键部署

### 1. 运行自动配置脚本

```bash
# 下载并运行配置脚本
curl -fsSL https://raw.githubusercontent.com/your-repo/tuyaopen-t5-setup/main/setup-tuyaopen-env.sh | bash

# 或者如果已下载
chmod +x setup-tuyaopen-env.sh
./setup-tuyaopen-env.sh
```

### 2. 验证环境

```bash
# 检查工具版本
git --version
python3 --version
node --version

# 检查 TuyaOpen
ls -la TuyaOpen/
```

### 3. 编译第一个项目

```bash
cd examples/hello_world
make clean
make
make run
```

## 🔧 手动配置 (如果自动脚本失败)

### macOS 系统

```bash
# 1. 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安装开发工具
brew install git python3 node cmake minicom

# 3. 克隆 TuyaOpen
git clone https://github.com/tuya/TuyaOpen.git

# 4. 安装 Python 依赖
pip3 install pyserial requests paho-mqtt esptool

# 5. 测试编译
cd TuyaOpen/examples/
# 选择一个示例项目进行编译测试
```

### Linux 系统

```bash
# 1. 更新包管理器
sudo apt update  # Ubuntu/Debian
# 或
sudo yum update  # CentOS/RHEL

# 2. 安装开发工具
sudo apt install -y git python3 python3-pip nodejs npm cmake build-essential minicom
# 或
sudo yum install -y git python3 python3-pip nodejs npm cmake gcc gcc-c++ make minicom

# 3. 克隆 TuyaOpen
git clone https://github.com/tuya/TuyaOpen.git

# 4. 安装 Python 依赖
pip3 install pyserial requests paho-mqtt esptool

# 5. 测试编译
cd TuyaOpen/examples/
# 选择一个示例项目进行编译测试
```

## 📱 涂鸦平台配置

### 1. 注册开发者账号

1. 访问 [涂鸦 IoT 开发平台](https://iot.tuya.com)
2. 注册并完成实名认证
3. 创建新的产品项目

### 2. 获取开发密钥

1. 在控制台创建应用
2. 获取以下信息：
   - App ID
   - App Secret
   - Product ID
   - Device ID
   - Device Secret

### 3. 配置环境变量

```bash
# 编辑配置文件
nano config/tuya_config.json

# 或设置环境变量
export TUYA_APP_ID="your_app_id"
export TUYA_APP_SECRET="your_app_secret"
export TUYA_PRODUCT_ID="your_product_id"
```

## 🔌 硬件连接

### T5 AI 开发板连接

1. **USB 连接**
   - 使用 USB-C 或 Micro-USB 线连接开发板
   - 确保数据线支持数据传输（不是仅充电线）

2. **串口识别**
   ```bash
   # macOS
   ls /dev/tty.usbserial-*
   ls /dev/cu.usbserial-*
   
   # Linux
   ls /dev/ttyUSB*
   ls /dev/ttyACM*
   
   # 查看设备信息
   dmesg | grep tty
   ```

3. **权限设置** (Linux)
   ```bash
   # 添加用户到 dialout 组
   sudo usermod -a -G dialout $USER
   
   # 重新登录或运行
   newgrp dialout
   ```

## 🛠️ 开发流程

### 1. 编译项目

```bash
# 进入项目目录
cd examples/hello_world

# 清理之前的编译
make clean

# 编译项目
make

# 本地运行测试
make run
```

### 2. 烧录固件

```bash
# 连接开发板后烧录
make flash

# 或手动烧录
python3 ../../tools/flash_tool.py --port /dev/ttyUSB0 --firmware hello_world
```

### 3. 监控调试

```bash
# 启动串口监控
make monitor

# 或手动监控
python3 ../../tools/serial_monitor.py --port /dev/ttyUSB0 --log ../../logs/serial.log
```

## 📊 开发工具推荐

### VS Code 配置

```bash
# 安装 VS Code
brew install --cask visual-studio-code  # macOS
# 或从官网下载安装

# 安装推荐扩展
code --install-extension ms-vscode.cpptools
code --install-extension ms-python.python
code --install-extension platformio.platformio-ide
```

### 串口调试工具

```bash
# 命令行工具
minicom -D /dev/ttyUSB0 -b 115200
screen /dev/ttyUSB0 115200

# 图形化工具 (macOS)
brew install --cask serial
```

## 🎯 第一个项目

### Hello World 示例

1. **编译运行**
   ```bash
   cd examples/hello_world
   make
   make run
   ```

2. **预期输出**
   ```
   === TuyaOpen T5 AI Hello World Demo ===
   Device: T5_AI_Demo
   Version: 1.0.0
   Firmware: 1.0.0
   =====================================
   
   Initializing Tuya IoT with version: 1.0.0
   Status callback registered
   Datapoint callback registered
   Starting Tuya IoT service...
   T5 AI Demo started successfully!
   Press Ctrl+C to exit...
   
   [1] Hello from T5 AI! Status: Running
   Processing IoT events...
   [2] Hello from T5 AI! Status: Running
   ...
   ```

3. **烧录到开发板**
   ```bash
   # 连接开发板
   make flash
   
   # 监控输出
   make monitor
   ```

## ⚡ 常用命令

### 项目管理

```bash
# 创建新项目
mkdir my_project
cd my_project
cp -r ../examples/hello_world/* .

# 编译项目
make clean && make

# 运行测试
make run
```

### 设备操作

```bash
# 查看串口设备
ls /dev/tty* | grep -E "(USB|ACM|usbserial)"

# 连接串口
screen /dev/ttyUSB0 115200

# 烧录固件
esptool.py --chip esp32 --port /dev/ttyUSB0 write_flash 0x0 firmware.bin
```

### 调试命令

```bash
# 查看系统日志
dmesg | tail -20

# 监控 USB 设备
lsusb  # Linux
system_profiler SPUSBDataType  # macOS

# 网络测试
ping iot.tuya.com
curl -I https://iot.tuya.com
```

## 📋 检查清单

### 环境验证

- [ ] ✅ Git 已安装并可用
- [ ] ✅ Python3 已安装 (版本 3.6+)
- [ ] ✅ Node.js 已安装 (版本 12+)
- [ ] ✅ CMake 已安装
- [ ] ✅ 串口工具已安装 (minicom/screen)

### 项目验证

- [ ] ✅ TuyaOpen 仓库已克隆
- [ ] ✅ 示例项目可以编译
- [ ] ✅ 配置文件已创建
- [ ] ✅ 开发工具脚本可执行

### 硬件验证

- [ ] ✅ T5 AI 开发板已连接
- [ ] ✅ 串口设备可识别
- [ ] ✅ 串口权限已设置
- [ ] ✅ 烧录工具可用

### 平台验证

- [ ] ✅ 涂鸦开发者账号已注册
- [ ] ✅ 产品项目已创建
- [ ] ✅ 开发密钥已获取
- [ ] ✅ 网络连接正常

## 🆘 遇到问题？

如果遇到问题，请查看：

1. **[故障排除指南](TROUBLESHOOTING.md)** - 常见问题解决方案
2. **[详细文档](README.md)** - 完整的配置说明
3. **[官方文档](https://developer.tuya.com)** - 涂鸦官方开发文档

或者运行诊断脚本：

```bash
# 运行环境诊断
./setup-tuyaopen-env.sh --check-only

# 查看详细日志
./setup-tuyaopen-env.sh --verbose
```

---

**预计时间**: 15-30 分钟  
**难度**: 初级  
**支持平台**: macOS, Linux