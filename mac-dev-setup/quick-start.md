# ⚡ Mac 开发环境快速开始指南

## 🎯 5分钟快速配置

如果你想快速开始，只需要运行我们的自动化脚本：

```bash
# 下载并运行自动配置脚本
curl -fsSL https://raw.githubusercontent.com/your-repo/mac-dev-setup/main/setup-dev-env.sh | bash

# 或者如果你已经下载了项目
chmod +x setup-dev-env.sh
./setup-dev-env.sh
```

## 📋 手动安装步骤

如果你更喜欢手动控制安装过程：

### 1. 安装 Xcode Command Line Tools
```bash
xcode-select --install
```

### 2. 安装 Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 3. 安装基础工具
```bash
brew install git python3 node wget curl tree htop
```

### 4. 安装开发应用
```bash
brew install --cask visual-studio-code iterm2 docker
```

### 5. 配置 Shell
```bash
# 安装 Oh My Zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 复制配置文件
cp config-templates/.zshrc ~/.zshrc
cp config-templates/.gitconfig ~/.gitconfig
```

## 🛠️ 按需求选择安装

### 前端开发者
```bash
# Node.js 工具
npm install -g yarn create-react-app @vue/cli @angular/cli
npm install -g http-server live-server nodemon eslint prettier

# 前端应用
brew install --cask figma postman google-chrome firefox
```

### 后端开发者
```bash
# 数据库
brew install mysql postgresql redis

# 后端工具
brew install --cask tableplus sequel-pro mongodb-compass

# API 测试
brew install --cask postman insomnia
```

### Python 开发者
```bash
# Python 工具
pip3 install virtualenv pipenv poetry
pip3 install requests flask django fastapi jupyter

# Python IDE
brew install --cask pycharm
```

### Java 开发者
```bash
# Java 环境
brew install openjdk@11 maven gradle

# Java IDE
brew install --cask intellij-idea
```

### 移动开发者
```bash
# iOS 开发 (需要从 App Store 安装 Xcode)
sudo gem install cocoapods
brew install fastlane

# Android 开发
brew install --cask android-studio

# 跨平台
brew install --cask flutter
npm install -g @react-native-community/cli @ionic/cli
```

## 🎨 设计师工具
```bash
brew install --cask figma sketch adobe-creative-cloud
```

## 🔧 系统优化

### 显示隐藏文件
```bash
defaults write com.apple.finder AppleShowAllFiles YES
killall Finder
```

### 配置 Git
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global core.editor "code --wait"
git config --global init.defaultBranch main
```

### 设置有用的别名
```bash
# 添加到 ~/.zshrc
echo 'alias ll="ls -la"' >> ~/.zshrc
echo 'alias gs="git status"' >> ~/.zshrc
echo 'alias serve="python3 -m http.server"' >> ~/.zshrc
source ~/.zshrc
```

## 📱 推荐的生产力应用

### 必备应用
```bash
# 窗口管理
brew install --cask rectangle

# 启动器
brew install --cask alfred

# 密码管理
brew install --cask 1password

# 解压工具
brew install --cask the-unarchiver

# 媒体播放器
brew install --cask vlc iina
```

### 可选应用
```bash
# 笔记应用
brew install --cask notion obsidian typora

# 系统监控
brew install --cask stats

# 网络工具
brew install --cask wireshark charles
```

## 🔍 验证安装

运行以下命令验证安装是否成功：

```bash
# 检查基础工具
git --version
python3 --version
node --version
npm --version

# 检查 Homebrew
brew --version
brew doctor

# 检查 Shell 配置
echo $SHELL
which zsh
```

## 🚀 下一步

1. **重启终端** 或运行 `source ~/.zshrc` 应用新配置
2. **打开 iTerm2** 享受更好的终端体验
3. **启动 VS Code** 开始编码
4. **配置你的第一个项目**

## 🆘 常见问题

### Homebrew 安装失败
```bash
# 如果网络问题，可以使用国内镜像
/bin/zsh -c "$(curl -fsSL https://gitee.com/cunkai/HomebrewCN/raw/master/Homebrew.sh)"
```

### 权限问题
```bash
# 修复 Homebrew 权限
sudo chown -R $(whoami) /opt/homebrew
```

### Python 版本问题
```bash
# 确保使用 Homebrew 安装的 Python
which python3
# 应该显示 /opt/homebrew/bin/python3
```

### Node.js 版本管理
```bash
# 安装 nvm 管理 Node.js 版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
nvm use node
```

## 📚 更多资源

- [完整工具清单](tools-list.md)
- [配置文件模板](config-templates/)
- [Homebrew 官方文档](https://brew.sh/)
- [Oh My Zsh 文档](https://ohmyz.sh/)

---

**快速开始完成！** 🎉 现在你已经有了一个强大的 Mac 开发环境。