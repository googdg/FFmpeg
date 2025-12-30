# 🍎 Mac 开发环境配置指南

## 📋 项目概述

这是一个完整的 Mac 开发环境配置指南，帮助开发者快速搭建高效的开发环境。

## 🚀 快速开始

### 1. 安装 Homebrew 包管理器

Homebrew 是 Mac 上最受欢迎的包管理器，推荐使用它来管理开发工具。

```bash
# 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 验证安装
brew --version
```

### 2. 升级系统工具

Mac 终端默认使用的工具版本较低，建议升级到最新版本。

```bash
# 升级 bash (Mac 默认使用较旧版本)
brew install bash

# 升级 git
brew install git

# 安装 make
brew install make
```

### 3. 安装 Python 开发环境

```bash
# 安装 Python3
brew install python3

# 验证安装
python3 --version
pip3 --version

# 安装常用 Python 包管理工具
pip3 install --upgrade pip
pip3 install virtualenv
pip3 install pipenv
```

## 🛠️ 开发工具安装

### 必备开发工具

```bash
# Node.js 和 npm
brew install node

# 验证安装
node --version
npm --version

# 安装 Yarn (可选)
brew install yarn
```

### 代码编辑器和 IDE

```bash
# Visual Studio Code
brew install --cask visual-studio-code

# 其他编辑器选项
brew install --cask sublime-text
brew install --cask atom
```

### 版本控制工具

```bash
# Git (如果还没安装)
brew install git

# Git GUI 工具
brew install --cask sourcetree
brew install --cask github
```

## 🔧 终端和 Shell 配置

### 安装现代化终端

```bash
# iTerm2 (推荐)
brew install --cask iterm2

# 或者 Hyper
brew install --cask hyper
```

### 安装 Zsh 和 Oh My Zsh

```bash
# 安装 Zsh (macOS Catalina+ 默认已安装)
brew install zsh

# 安装 Oh My Zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 安装有用的 Zsh 插件
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

## 📦 包管理器配置

### Homebrew 优化

```bash
# 添加到 ~/.zshrc 或 ~/.bash_profile
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc

# 重新加载配置
source ~/.zshrc

# 更新 Homebrew
brew update && brew upgrade
```

### npm 配置

```bash
# 设置 npm 镜像源 (可选，提高下载速度)
npm config set registry https://registry.npmmirror.com/

# 查看配置
npm config list
```

## 🌐 Web 开发环境

### 前端开发工具

```bash
# 安装常用的全局包
npm install -g create-react-app
npm install -g @vue/cli
npm install -g @angular/cli
npm install -g http-server
npm install -g live-server
```

### 后端开发工具

```bash
# Java 开发环境
brew install openjdk@11
brew install maven
brew install gradle

# PHP 开发环境
brew install php
brew install composer

# Ruby 开发环境
brew install ruby
gem install bundler
```

## 🗄️ 数据库安装

### 关系型数据库

```bash
# MySQL
brew install mysql
brew services start mysql

# PostgreSQL
brew install postgresql
brew services start postgresql

# SQLite (通常已预装)
brew install sqlite
```

### NoSQL 数据库

```bash
# MongoDB
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community

# Redis
brew install redis
brew services start redis
```

## 🔍 实用工具

### 命令行工具

```bash
# 文件搜索和管理
brew install fzf
brew install ripgrep
brew install fd
brew install tree

# 系统监控
brew install htop
brew install neofetch

# 网络工具
brew install wget
brew install curl
brew install httpie
```

### 开发辅助工具

```bash
# Docker
brew install --cask docker

# Postman (API 测试)
brew install --cask postman

# 数据库管理工具
brew install --cask sequel-pro
brew install --cask tableplus
```

## ⚙️ 系统配置优化

### 显示隐藏文件

```bash
# 在 Finder 中显示隐藏文件
defaults write com.apple.finder AppleShowAllFiles YES
killall Finder
```

### 配置 Git

```bash
# 设置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 设置默认编辑器
git config --global core.editor "code --wait"

# 设置默认分支名
git config --global init.defaultBranch main
```

## 📝 配置文件模板

### .zshrc 配置示例

```bash
# ~/.zshrc

# Oh My Zsh 配置
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="robbyrussell"

# 插件配置
plugins=(
    git
    zsh-autosuggestions
    zsh-syntax-highlighting
    node
    npm
    python
)

source $ZSH/oh-my-zsh.sh

# 环境变量
export PATH="/opt/homebrew/bin:$PATH"
export PATH="$HOME/.local/bin:$PATH"

# 别名
alias ll="ls -la"
alias la="ls -A"
alias l="ls -CF"
alias ..="cd .."
alias ...="cd ../.."

# 开发相关别名
alias gs="git status"
alias ga="git add"
alias gc="git commit"
alias gp="git push"
alias gl="git pull"

# Python 虚拟环境
alias venv="python3 -m venv"
alias activate="source venv/bin/activate"
```

## 🚀 快速安装脚本

创建一个自动化安装脚本：

```bash
#!/bin/bash
# setup-dev-env.sh

echo "🍎 开始配置 Mac 开发环境..."

# 检查是否安装了 Homebrew
if ! command -v brew &> /dev/null; then
    echo "📦 安装 Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# 更新 Homebrew
echo "🔄 更新 Homebrew..."
brew update

# 安装基础工具
echo "🛠️ 安装基础开发工具..."
brew install git python3 node wget curl tree htop

# 安装开发应用
echo "💻 安装开发应用..."
brew install --cask visual-studio-code iterm2 docker

# 安装 Oh My Zsh
if [ ! -d "$HOME/.oh-my-zsh" ]; then
    echo "🐚 安装 Oh My Zsh..."
    sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
fi

echo "✅ Mac 开发环境配置完成！"
echo "🔄 请重启终端或运行 'source ~/.zshrc' 来应用配置"
```

## 📚 参考资源

- [Homebrew 官方网站](https://brew.sh/)
- [Oh My Zsh 官方文档](https://ohmyz.sh/)
- [Git 官方文档](https://git-scm.com/doc)
- [Node.js 官方网站](https://nodejs.org/)
- [Python 官方网站](https://www.python.org/)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个配置指南！

## 📄 许可证

MIT License

---

**最后更新**: 2024年10月26日