# 🛠️ Mac 开发工具清单

## 📦 包管理器

### Homebrew
```bash
# 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 常用命令
brew install <package>      # 安装包
brew install --cask <app>   # 安装应用
brew update                 # 更新 Homebrew
brew upgrade                # 升级所有包
brew list                   # 列出已安装的包
brew search <keyword>       # 搜索包
brew info <package>         # 查看包信息
brew cleanup               # 清理旧版本
```

## 🔧 命令行工具

### 基础工具
- **git** - 版本控制系统
- **wget** - 文件下载工具
- **curl** - 数据传输工具
- **tree** - 目录结构显示
- **htop** - 系统监控工具
- **neofetch** - 系统信息显示

### 搜索和文件管理
- **fzf** - 模糊搜索工具
- **ripgrep (rg)** - 快速文本搜索
- **fd** - 快速文件查找
- **bat** - 增强版 cat
- **exa** - 现代化的 ls 替代品

```bash
# 安装搜索工具
brew install fzf ripgrep fd bat exa

# 使用示例
rg "function" --type js     # 在 JS 文件中搜索 "function"
fd "*.py"                   # 查找所有 Python 文件
bat file.js                 # 语法高亮显示文件内容
exa -la                     # 美化的文件列表
```

### 网络工具
- **httpie** - 现代化的 HTTP 客户端
- **nmap** - 网络扫描工具
- **speedtest-cli** - 网速测试

```bash
# 安装网络工具
brew install httpie nmap speedtest-cli

# 使用示例
http GET https://api.github.com/users/octocat
nmap -sP 192.168.1.0/24
speedtest-cli
```

## 💻 开发环境

### 编程语言

#### Python
```bash
# 安装 Python
brew install python3

# 包管理工具
pip3 install virtualenv pipenv poetry

# 常用包
pip3 install requests flask django fastapi jupyter
```

#### Node.js
```bash
# 安装 Node.js
brew install node

# 全局包
npm install -g yarn pnpm
npm install -g create-react-app @vue/cli @angular/cli
npm install -g http-server live-server nodemon pm2
npm install -g eslint prettier typescript
```

#### Java
```bash
# 安装 Java
brew install openjdk@11 openjdk@17

# 构建工具
brew install maven gradle

# 设置 JAVA_HOME
echo 'export JAVA_HOME=$(/usr/libexec/java_home)' >> ~/.zshrc
```

#### Go
```bash
# 安装 Go
brew install go

# 设置环境变量
echo 'export GOPATH=$HOME/go' >> ~/.zshrc
echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.zshrc
```

#### Rust
```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 常用工具
cargo install cargo-watch cargo-edit
```

#### Ruby
```bash
# 安装 Ruby
brew install ruby rbenv

# 设置环境变量
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc

# 安装 Bundler
gem install bundler
```

### 数据库

#### 关系型数据库
```bash
# MySQL
brew install mysql
brew services start mysql

# PostgreSQL
brew install postgresql
brew services start postgresql

# SQLite
brew install sqlite
```

#### NoSQL 数据库
```bash
# MongoDB
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community

# Redis
brew install redis
brew services start redis
```

## 🎨 开发应用

### 代码编辑器
```bash
# Visual Studio Code
brew install --cask visual-studio-code

# Sublime Text
brew install --cask sublime-text

# Atom
brew install --cask atom

# Vim/Neovim
brew install vim neovim
```

### IDE
```bash
# IntelliJ IDEA
brew install --cask intellij-idea

# WebStorm
brew install --cask webstorm

# PyCharm
brew install --cask pycharm

# Android Studio
brew install --cask android-studio

# Xcode (从 App Store 安装)
```

### 终端
```bash
# iTerm2 (推荐)
brew install --cask iterm2

# Hyper
brew install --cask hyper

# Alacritty
brew install --cask alacritty
```

## 🔍 调试和测试工具

### API 测试
```bash
# Postman
brew install --cask postman

# Insomnia
brew install --cask insomnia
```

### 数据库管理
```bash
# Sequel Pro (MySQL)
brew install --cask sequel-pro

# TablePlus (多数据库)
brew install --cask tableplus

# MongoDB Compass
brew install --cask mongodb-compass
```

### 版本控制 GUI
```bash
# SourceTree
brew install --cask sourcetree

# GitHub Desktop
brew install --cask github

# GitKraken
brew install --cask gitkraken
```

## 🐳 容器化和虚拟化

### Docker
```bash
# Docker Desktop
brew install --cask docker

# Docker Compose (包含在 Docker Desktop 中)

# 常用命令
docker --version
docker-compose --version
```

### 虚拟机
```bash
# VirtualBox
brew install --cask virtualbox

# VMware Fusion
brew install --cask vmware-fusion

# Parallels Desktop (付费)
```

## 🌐 浏览器和网络

### 浏览器
```bash
# Google Chrome
brew install --cask google-chrome

# Firefox
brew install --cask firefox

# Microsoft Edge
brew install --cask microsoft-edge

# Brave
brew install --cask brave-browser
```

### 网络工具
```bash
# Wireshark
brew install --cask wireshark

# Charles Proxy
brew install --cask charles

# Proxyman
brew install --cask proxyman
```

## 📱 移动开发

### iOS 开发
```bash
# Xcode (从 App Store 安装)
# iOS Simulator (包含在 Xcode 中)

# CocoaPods
sudo gem install cocoapods

# Fastlane
brew install fastlane
```

### Android 开发
```bash
# Android Studio
brew install --cask android-studio

# Android SDK 命令行工具
brew install --cask android-commandlinetools
```

### 跨平台开发
```bash
# Flutter
brew install --cask flutter

# React Native CLI
npm install -g @react-native-community/cli

# Ionic
npm install -g @ionic/cli
```

## 🎯 生产力工具

### 文档和笔记
```bash
# Notion
brew install --cask notion

# Obsidian
brew install --cask obsidian

# Typora
brew install --cask typora

# MacDown (Markdown 编辑器)
brew install --cask macdown
```

### 设计工具
```bash
# Figma
brew install --cask figma

# Sketch
brew install --cask sketch

# Adobe Creative Cloud
brew install --cask adobe-creative-cloud
```

### 系统工具
```bash
# Alfred (启动器)
brew install --cask alfred

# Rectangle (窗口管理)
brew install --cask rectangle

# CleanMyMac X (系统清理)
brew install --cask cleanmymac

# The Unarchiver (解压工具)
brew install --cask the-unarchiver
```

## 🔒 安全工具

### 密码管理
```bash
# 1Password
brew install --cask 1password

# Bitwarden
brew install --cask bitwarden

# KeePassXC
brew install --cask keepassxc
```

### VPN
```bash
# Tunnelblick (OpenVPN)
brew install --cask tunnelblick

# WireGuard
brew install --cask wireguard-tools
```

## 📊 监控和分析

### 系统监控
```bash
# Activity Monitor (系统自带)
# iStat Menus
brew install --cask istat-menus

# Stats (免费替代品)
brew install --cask stats
```

### 网络监控
```bash
# Little Snitch (网络防火墙)
brew install --cask little-snitch

# Network Radar
brew install --cask network-radar
```

## 🎵 媒体工具

### 音视频
```bash
# VLC
brew install --cask vlc

# IINA (现代化播放器)
brew install --cask iina

# HandBrake (视频转换)
brew install --cask handbrake

# Audacity (音频编辑)
brew install --cask audacity
```

## 📋 安装脚本示例

### 基础开发环境
```bash
#!/bin/bash
# 基础开发环境安装脚本

# 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装基础工具
brew install git python3 node wget curl tree htop

# 安装开发应用
brew install --cask visual-studio-code iterm2 docker

# 安装 Oh My Zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

echo "基础开发环境安装完成！"
```

### 前端开发环境
```bash
#!/bin/bash
# 前端开发环境安装脚本

# 安装 Node.js 工具
npm install -g yarn create-react-app @vue/cli
npm install -g http-server live-server nodemon
npm install -g eslint prettier typescript

# 安装前端相关应用
brew install --cask figma postman google-chrome

echo "前端开发环境安装完成！"
```

### Python 开发环境
```bash
#!/bin/bash
# Python 开发环境安装脚本

# 安装 Python 工具
pip3 install virtualenv pipenv poetry
pip3 install requests flask django fastapi
pip3 install jupyter pandas numpy matplotlib

# 安装 Python IDE
brew install --cask pycharm

echo "Python 开发环境安装完成！"
```

## 🔧 维护命令

### 系统更新
```bash
# 更新所有 Homebrew 包
brew update && brew upgrade && brew cleanup

# 更新 npm 全局包
npm update -g

# 更新 pip 包
pip3 list --outdated --format=freeze | grep -v '^\-e' | cut -d = -f 1 | xargs -n1 pip3 install -U

# 清理系统缓存
sudo purge
```

### 健康检查
```bash
# Homebrew 健康检查
brew doctor

# 磁盘使用情况
df -h

# 查看大文件
du -sh * | sort -hr | head -10
```

---

**提示**: 根据你的具体开发需求选择安装相应的工具，不需要全部安装。