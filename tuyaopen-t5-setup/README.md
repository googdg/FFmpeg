# 🤖 TuyaOpen T5 AI 开发板本地环境部署

## 📋 项目概述

**项目名称**: TuyaOpen T5 AI 硬件开发环境  
**开发平台**: 涂鸦智能 IoT 平台  
**目标硬件**: T5 AI 开发板  
**开发系统**: macOS (推荐使用 Homebrew)  

## 🚀 快速开始

### 前置要求
- macOS 系统
- 稳定的网络连接
- 至少 2GB 可用磁盘空间

## 🛠️ 环境部署步骤

### 1. 安装 Homebrew 包管理器

根据 TuyaOpen 官方推荐，使用 Homebrew 进行环境管理：

```bash
# 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 验证安装
brew --version
```

### 2. 升级系统工具

Mac 终端默认使用的工具版本较低，推荐升级：

```bash
# 升级 bash
brew install bash

# 安装必要的工具
brew install python3
brew install git  
brew install make
```

### 3. 下载并激活 TuyaOpen

#### 方法一：使用 GitHub (推荐)
```bash
# 克隆 TuyaOpen 仓库
git clone https://github.com/tuya/TuyaOpen.git

# 进入项目目录
cd TuyaOpen
```

#### 方法二：使用 Gitee (国内用户)
```bash
# 克隆 TuyaOpen 仓库 (Gitee镜像)
git clone https://gitee.com/tuya-open/TuyaOpen.git

# 进入项目目录
cd TuyaOpen
```

### 4. 配置 Git 环境

```bash
# 配置 Git 缓冲区大小 (提高性能)
git config --global http.postBuffer 524288000

# 配置用户信息 (如果还没配置)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**重要提示**: 选择项目路径时，不使用中文，也不要包含空格等特殊字符。Windows环境不要选择C盘。

## 🔧 开发环境配置

### 安装 Python 开发环境

```bash
# 验证 Python3 安装
python3 --version

# 安装 pip 包管理器 (如果需要)
python3 -m ensurepip --upgrade

# 安装常用的 Python 包
pip3 install --upgrade pip
pip3 install virtualenv
```

### 安装 Node.js (如果需要 Web 开发)

```bash
# 安装 Node.js
brew install node

# 验证安装
node --version
npm --version
```

### 安装编译工具链

```bash
# 安装 GCC 编译器
brew install gcc

# 安装 CMake (如果需要)
brew install cmake

# 安装 Make 工具
brew install make
```

## 🎯 T5 AI 开发板特定配置

### 1. 安装串口调试工具

```bash
# 安装串口通信工具
brew install minicom
brew install screen

# 或者安装图形化串口工具
brew install --cask serial
```

### 2. 安装烧录工具

```bash
# 安装 esptool (如果是 ESP 系列芯片)
pip3 install esptool

# 验证安装
esptool.py version
```

### 3. 配置 USB 串口权限

```bash
# 查看串口设备
ls /dev/tty.*

# 添加用户到 dialout 组 (Linux风格，macOS可能不需要)
# sudo usermod -a -G dialout $USER
```

## 📱 涂鸦 IoT 平台配置

### 1. 注册涂鸦开发者账号

访问: https://iot.tuya.com
1. 注册开发者账号
2. 创建新的产品
3. 获取产品 ID 和密钥

### 2. 配置开发环境变量

```bash
# 创建环境配置文件
cat > .env << EOF
# 涂鸦 IoT 平台配置
TUYA_PRODUCT_ID=your_product_id
TUYA_DEVICE_ID=your_device_id
TUYA_DEVICE_SECRET=your_device_secret
TUYA_REGION=cn  # 或 us, eu

# 开发配置
DEBUG_MODE=true
LOG_LEVEL=debug
EOF
```

### 3. 安装涂鸦 CLI 工具 (如果有)

```bash
# 安装涂鸦命令行工具
npm install -g @tuya/cli

# 或者使用 pip 安装
pip3 install tuya-cli
```

## 🔨 编译和烧录环境

### 1. 安装交叉编译工具链

```bash
# 安装 ARM 交叉编译工具 (如果需要)
brew install arm-none-eabi-gcc

# 或者安装 RISC-V 工具链 (根据芯片类型)
brew install riscv64-elf-gcc
```

### 2. 配置编译环境

```bash
# 设置编译环境变量
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
echo 'export TUYA_SDK_PATH="$HOME/TuyaOpen"' >> ~/.zshrc

# 重新加载配置
source ~/.zshrc
```

### 3. 验证编译环境

```bash
# 检查编译工具
gcc --version
make --version
python3 --version

# 检查 TuyaOpen SDK
ls -la TuyaOpen/
```

## 🧪 测试环境

### 1. 编译测试项目

```bash
# 进入 TuyaOpen 目录
cd TuyaOpen

# 查看可用的示例项目
ls examples/

# 编译一个示例项目 (具体路径根据实际情况调整)
cd examples/hello_world
make clean
make
```

### 2. 串口连接测试

```bash
# 连接开发板 (替换为实际的串口设备)
screen /dev/tty.usbserial-* 115200

# 或使用 minicom
minicom -D /dev/tty.usbserial-* -b 115200
```

### 3. 烧录测试

```bash
# 烧录固件到开发板 (示例命令)
esptool.py --chip esp32 --port /dev/tty.usbserial-* write_flash 0x0 firmware.bin

# 或使用 TuyaOpen 提供的烧录脚本
./flash.sh
```

## 📊 开发工具推荐

### 代码编辑器配置

#### Visual Studio Code
```bash
# 安装 VS Code
brew install --cask visual-studio-code

# 推荐的扩展插件
code --install-extension ms-vscode.cpptools
code --install-extension ms-python.python
code --install-extension platformio.platformio-ide
```

#### 配置 VS Code 工作区
```json
{
    "folders": [
        {
            "path": "./TuyaOpen"
        }
    ],
    "settings": {
        "C_Cpp.default.includePath": [
            "${workspaceFolder}/include",
            "${workspaceFolder}/components"
        ],
        "python.defaultInterpreterPath": "/opt/homebrew/bin/python3"
    }
}
```

### 调试工具

```bash
# 安装 GDB 调试器
brew install gdb

# 安装 OpenOCD (在线调试)
brew install openocd

# 安装逻辑分析仪软件
brew install --cask pulseview
```

## 🌐 网络和云服务配置

### 1. 配置涂鸦云连接

```bash
# 测试网络连接
ping iot.tuya.com

# 配置代理 (如果需要)
export http_proxy=http://proxy.company.com:8080
export https_proxy=http://proxy.company.com:8080
```

### 2. 配置 MQTT 客户端 (如果需要)

```bash
# 安装 MQTT 客户端
brew install mosquitto

# 测试 MQTT 连接
mosquitto_pub -h mqtt.tuya.com -p 1883 -t test/topic -m "Hello TuyaOpen"
```

## 📋 环境验证清单

### 基础环境检查
- [ ] ✅ Homebrew 安装成功
- [ ] ✅ Python3 可用 (`python3 --version`)
- [ ] ✅ Git 可用 (`git --version`)
- [ ] ✅ Make 工具可用 (`make --version`)

### TuyaOpen 环境检查
- [ ] ✅ TuyaOpen 仓库克隆成功
- [ ] ✅ 示例项目可以编译
- [ ] ✅ 串口工具可以连接设备
- [ ] ✅ 烧录工具正常工作

### 开发工具检查
- [ ] ✅ VS Code 安装并配置
- [ ] ✅ 必要的扩展插件已安装
- [ ] ✅ 调试工具可用

### 网络连接检查
- [ ] ✅ 可以访问 iot.tuya.com
- [ ] ✅ GitHub/Gitee 连接正常
- [ ] ✅ 涂鸦云服务连接正常

## 🆘 常见问题解决

### 1. Homebrew 安装失败
```bash
# 使用国内镜像安装
/bin/zsh -c "$(curl -fsSL https://gitee.com/cunkai/HomebrewCN/raw/master/Homebrew.sh)"
```

### 2. Git 克隆速度慢
```bash
# 使用 Gitee 镜像
git clone https://gitee.com/tuya-open/TuyaOpen.git

# 或配置 Git 代理
git config --global http.proxy http://proxy:port
```

### 3. 串口设备找不到
```bash
# 查看所有 USB 设备
system_profiler SPUSBDataType

# 查看串口设备
ls /dev/tty.*
ls /dev/cu.*
```

### 4. 编译错误
```bash
# 清理编译缓存
make clean

# 检查依赖
brew doctor

# 重新安装编译工具
brew reinstall gcc make
```

## 📚 参考资源

- [TuyaOpen GitHub](https://github.com/tuya/TuyaOpen)
- [涂鸦 IoT 开发平台](https://iot.tuya.com)
- [T5 AI 开发板文档](https://developer.tuya.com/cn/docs/iot/t5-ai-board)
- [Homebrew 官方文档](https://brew.sh/)

## 🎯 下一步

环境部署完成后，你可以：

1. **浏览示例项目** - 查看 TuyaOpen/examples/ 目录
2. **编译第一个项目** - 选择一个 Hello World 示例
3. **连接开发板** - 通过串口连接 T5 AI 开发板
4. **烧录固件** - 将编译好的固件烧录到开发板
5. **开始开发** - 基于示例代码开发你的 AI 应用

---

**部署时间**: 约 15-20 分钟  
**难度等级**: 初级  
**支持平台**: macOS