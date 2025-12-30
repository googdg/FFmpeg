# ~/.zshrc - Mac 开发环境配置

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
    docker
    vscode
)

source $ZSH/oh-my-zsh.sh

# 环境变量
export PATH="/opt/homebrew/bin:$PATH"
export PATH="$HOME/.local/bin:$PATH"
export PATH="/usr/local/bin:$PATH"

# 编辑器配置
export EDITOR="code --wait"
export VISUAL="code --wait"

# 语言环境
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# 历史配置
export HISTSIZE=10000
export SAVEHIST=10000
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_SPACE
setopt SHARE_HISTORY

# 基础别名
alias ll="ls -la"
alias la="ls -A"
alias l="ls -CF"
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."

# Git 别名
alias gs="git status"
alias ga="git add"
alias gaa="git add ."
alias gc="git commit"
alias gcm="git commit -m"
alias gp="git push"
alias gl="git pull"
alias gco="git checkout"
alias gb="git branch"
alias gd="git diff"
alias glog="git log --oneline --graph --decorate"

# Python 开发
alias python="python3"
alias pip="pip3"
alias venv="python3 -m venv"
alias activate="source venv/bin/activate"
alias deactivate="deactivate"

# Node.js 开发
alias ni="npm install"
alias nid="npm install --save-dev"
alias nig="npm install -g"
alias nr="npm run"
alias ns="npm start"
alias nt="npm test"
alias nb="npm run build"

# 常用目录
alias desktop="cd ~/Desktop"
alias downloads="cd ~/Downloads"
alias documents="cd ~/Documents"
alias projects="cd ~/Projects"

# 系统相关
alias showfiles="defaults write com.apple.finder AppleShowAllFiles YES; killall Finder"
alias hidefiles="defaults write com.apple.finder AppleShowAllFiles NO; killall Finder"
alias flushdns="sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder"

# 网络相关
alias myip="curl http://ipecho.net/plain; echo"
alias localip="ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1'"
alias ports="lsof -i -P -n | grep LISTEN"

# 开发服务器
alias serve="python3 -m http.server"
alias serve8080="python3 -m http.server 8080"
alias liveserver="live-server"

# Docker 相关
alias dps="docker ps"
alias dpsa="docker ps -a"
alias di="docker images"
alias dstop="docker stop"
alias drm="docker rm"
alias drmi="docker rmi"
alias dprune="docker system prune -f"

# 清理相关
alias cleanup="brew cleanup && npm cache clean --force && docker system prune -f"
alias cleands="find . -name '.DS_Store' -type f -delete"

# 快速编辑配置文件
alias zshconfig="code ~/.zshrc"
alias gitconfig="code ~/.gitconfig"
alias hosts="sudo code /etc/hosts"

# 显示系统信息
alias sysinfo="neofetch"
alias cpu="top -l 1 | head -n 10 | grep -E '^CPU|^Processes'"
alias memory="top -l 1 | head -n 10 | grep -E '^PhysMem'"

# Homebrew 相关
alias brewup="brew update && brew upgrade && brew cleanup"
alias brewlist="brew list && echo '--- Casks ---' && brew list --cask"
alias brewinfo="brew info"
alias brewsearch="brew search"

# 快速创建项目
alias mkproject="mkdir -p ~/Projects"
alias cdproject="cd ~/Projects"

# 文件搜索
alias ff="find . -name"
alias grep="grep --color=auto"

# 压缩和解压
alias zip="zip -r"
alias untar="tar -xvf"
alias ungz="tar -xzf"

# 快速启动应用
alias chrome="open -a 'Google Chrome'"
alias firefox="open -a 'Firefox'"
alias safari="open -a 'Safari'"
alias finder="open ."

# 开发工具快捷方式
alias code.="code ."
alias subl.="subl ."

# 自定义函数
# 创建目录并进入
mkcd() {
    mkdir -p "$1" && cd "$1"
}

# 快速查找并杀死进程
killport() {
    if [ $# -eq 0 ]; then
        echo "Usage: killport <port>"
        return 1
    fi
    lsof -ti:$1 | xargs kill -9
}

# 快速创建 Python 虚拟环境
mkvenv() {
    if [ $# -eq 0 ]; then
        python3 -m venv venv
    else
        python3 -m venv "$1"
    fi
}

# 快速启动 HTTP 服务器
server() {
    local port="${1:-8000}"
    python3 -m http.server "$port"
}

# 快速 Git 提交
gac() {
    git add .
    git commit -m "$1"
}

# 快速 Git 推送
gacp() {
    git add .
    git commit -m "$1"
    git push
}

# 快速创建 React 项目
create-react() {
    if [ $# -eq 0 ]; then
        echo "Usage: create-react <project-name>"
        return 1
    fi
    npx create-react-app "$1"
    cd "$1"
}

# 快速创建 Vue 项目
create-vue() {
    if [ $# -eq 0 ]; then
        echo "Usage: create-vue <project-name>"
        return 1
    fi
    vue create "$1"
    cd "$1"
}

# 显示当前 Git 分支
git_branch() {
    git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/(\1)/'
}

# 欢迎信息
print_welcome() {
    echo "🍎 Welcome to Mac Development Environment!"
    echo "📚 Type 'help-dev' to see available commands"
}

# 开发帮助
help-dev() {
    echo "🛠️  Mac Development Environment - Quick Commands"
    echo "================================================"
    echo ""
    echo "📁 Navigation:"
    echo "   desktop, downloads, documents, projects"
    echo ""
    echo "🔧 Git:"
    echo "   gs (status), ga (add), gc (commit), gp (push), gl (pull)"
    echo "   gac 'message' (add & commit), gacp 'message' (add, commit & push)"
    echo ""
    echo "🐍 Python:"
    echo "   mkvenv [name] (create virtual env), activate, deactivate"
    echo ""
    echo "📦 Node.js:"
    echo "   ni (install), nr (run), ns (start), nt (test), nb (build)"
    echo ""
    echo "🌐 Servers:"
    echo "   serve [port] (HTTP server), liveserver (live reload)"
    echo ""
    echo "🐳 Docker:"
    echo "   dps (ps), di (images), dstop (stop), drm (remove)"
    echo ""
    echo "🧹 Cleanup:"
    echo "   cleanup (brew + npm + docker), cleands (remove .DS_Store)"
    echo ""
    echo "🔍 System:"
    echo "   sysinfo, cpu, memory, ports, myip, localip"
    echo ""
    echo "⚡ Quick Actions:"
    echo "   mkcd <dir> (mkdir + cd), killport <port>, ff <filename>"
    echo ""
}

# 启动时显示欢迎信息
print_welcome