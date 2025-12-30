#!/bin/bash

# Mac 开发环境自动配置脚本
# 作者: Mac Dev Setup Project
# 日期: 2024-10-26

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# 检查是否为 macOS
check_macos() {
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "此脚本仅适用于 macOS 系统"
        exit 1
    fi
}

# 检查并安装 Xcode Command Line Tools
install_xcode_tools() {
    print_step "检查 Xcode Command Line Tools..."
    
    if ! xcode-select -p &> /dev/null; then
        print_message "安装 Xcode Command Line Tools..."
        xcode-select --install
        
        print_warning "请在弹出的对话框中点击 '安装' 按钮"
        print_warning "安装完成后请重新运行此脚本"
        exit 0
    else
        print_message "Xcode Command Line Tools 已安装"
    fi
}

# 安装 Homebrew
install_homebrew() {
    print_step "检查并安装 Homebrew..."
    
    if ! command -v brew &> /dev/null; then
        print_message "安装 Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # 添加 Homebrew 到 PATH
        if [[ -f "/opt/homebrew/bin/brew" ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
    else
        print_message "Homebrew 已安装"
    fi
    
    # 更新 Homebrew
    print_message "更新 Homebrew..."
    brew update
}

# 安装基础开发工具
install_basic_tools() {
    print_step "安装基础开发工具..."
    
    local tools=(
        "git"
        "python3"
        "node"
        "wget"
        "curl"
        "tree"
        "htop"
        "fzf"
        "ripgrep"
        "fd"
    )
    
    for tool in "${tools[@]}"; do
        if brew list "$tool" &> /dev/null; then
            print_message "$tool 已安装"
        else
            print_message "安装 $tool..."
            brew install "$tool"
        fi
    done
}

# 安装开发应用
install_dev_apps() {
    print_step "安装开发应用..."
    
    local apps=(
        "visual-studio-code"
        "iterm2"
        "docker"
        "postman"
    )
    
    for app in "${apps[@]}"; do
        if brew list --cask "$app" &> /dev/null; then
            print_message "$app 已安装"
        else
            print_message "安装 $app..."
            brew install --cask "$app"
        fi
    done
}

# 安装 Oh My Zsh
install_oh_my_zsh() {
    print_step "安装 Oh My Zsh..."
    
    if [[ ! -d "$HOME/.oh-my-zsh" ]]; then
        print_message "安装 Oh My Zsh..."
        sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
        
        # 安装有用的插件
        print_message "安装 Zsh 插件..."
        
        # zsh-autosuggestions
        if [[ ! -d "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-autosuggestions" ]]; then
            git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
        fi
        
        # zsh-syntax-highlighting
        if [[ ! -d "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting" ]]; then
            git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
        fi
    else
        print_message "Oh My Zsh 已安装"
    fi
}

# 配置 Git
configure_git() {
    print_step "配置 Git..."
    
    # 检查是否已配置用户信息
    if [[ -z "$(git config --global user.name)" ]]; then
        read -p "请输入您的 Git 用户名: " git_username
        git config --global user.name "$git_username"
    fi
    
    if [[ -z "$(git config --global user.email)" ]]; then
        read -p "请输入您的 Git 邮箱: " git_email
        git config --global user.email "$git_email"
    fi
    
    # 设置默认编辑器
    git config --global core.editor "code --wait"
    
    # 设置默认分支名
    git config --global init.defaultBranch main
    
    print_message "Git 配置完成"
}

# 创建 .zshrc 配置
create_zshrc() {
    print_step "创建 .zshrc 配置..."
    
    # 备份现有的 .zshrc
    if [[ -f "$HOME/.zshrc" ]]; then
        cp "$HOME/.zshrc" "$HOME/.zshrc.backup.$(date +%Y%m%d_%H%M%S)"
        print_message "已备份现有的 .zshrc 文件"
    fi
    
    cat > "$HOME/.zshrc" << 'EOF'
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
    brew
    macos
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
alias gco="git checkout"
alias gb="git branch"

# Python 虚拟环境
alias venv="python3 -m venv"
alias activate="source venv/bin/activate"

# 常用目录
alias desktop="cd ~/Desktop"
alias downloads="cd ~/Downloads"
alias documents="cd ~/Documents"

# 系统相关
alias showfiles="defaults write com.apple.finder AppleShowAllFiles YES; killall Finder"
alias hidefiles="defaults write com.apple.finder AppleShowAllFiles NO; killall Finder"

# 网络相关
alias myip="curl http://ipecho.net/plain; echo"
alias localip="ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1'"

# 开发服务器
alias serve="python3 -m http.server"
alias npmls="npm list -g --depth=0"

# 清理相关
alias cleanup="brew cleanup && npm cache clean --force"

# 快速编辑配置文件
alias zshconfig="code ~/.zshrc"
alias gitconfig="code ~/.gitconfig"

# 显示系统信息
alias sysinfo="neofetch"

# Homebrew 相关
alias brewup="brew update && brew upgrade && brew cleanup"
alias brewlist="brew list && brew list --cask"

print_message() {
    echo "🍎 Mac 开发环境配置完成！"
}
EOF

    print_message ".zshrc 配置文件已创建"
}

# 安装常用的 npm 包
install_npm_packages() {
    print_step "安装常用的 npm 全局包..."
    
    local packages=(
        "http-server"
        "live-server"
        "nodemon"
        "pm2"
        "yarn"
    )
    
    for package in "${packages[@]}"; do
        if npm list -g "$package" &> /dev/null; then
            print_message "$package 已安装"
        else
            print_message "安装 $package..."
            npm install -g "$package"
        fi
    done
}

# 安装 Python 包
install_python_packages() {
    print_step "安装常用的 Python 包..."
    
    local packages=(
        "virtualenv"
        "pipenv"
        "requests"
        "flask"
        "django"
    )
    
    for package in "${packages[@]}"; do
        if pip3 list | grep -q "$package"; then
            print_message "$package 已安装"
        else
            print_message "安装 $package..."
            pip3 install "$package"
        fi
    done
}

# 显示完成信息
show_completion_info() {
    print_step "安装完成！"
    
    echo ""
    echo "🎉 Mac 开发环境配置完成！"
    echo ""
    echo "📋 已安装的工具："
    echo "   • Homebrew 包管理器"
    echo "   • Git 版本控制"
    echo "   • Python3 和常用包"
    echo "   • Node.js 和 npm"
    echo "   • Visual Studio Code"
    echo "   • iTerm2 终端"
    echo "   • Docker"
    echo "   • Oh My Zsh 和插件"
    echo ""
    echo "🔄 下一步："
    echo "   1. 重启终端或运行: source ~/.zshrc"
    echo "   2. 打开 iTerm2 享受更好的终端体验"
    echo "   3. 打开 VS Code 开始编码"
    echo ""
    echo "📚 更多配置选项请查看 README.md"
    echo ""
}

# 主函数
main() {
    echo "🍎 Mac 开发环境自动配置脚本"
    echo "================================"
    echo ""
    
    check_macos
    install_xcode_tools
    install_homebrew
    install_basic_tools
    install_dev_apps
    install_oh_my_zsh
    configure_git
    create_zshrc
    install_npm_packages
    install_python_packages
    show_completion_info
}

# 运行主函数
main "$@"