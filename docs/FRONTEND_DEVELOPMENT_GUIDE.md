# 🎨 前端开发指南

## 📋 项目概述

**技术栈**: HTML5 + CSS3 + 原生JavaScript  
**设计风格**: YouTube风格的视频平台  
**响应式**: 支持桌面端和移动端  

## 🏗️ 项目结构

```
frontend/
├── 📄 核心页面
│   ├── aoyou-youtube-style.html   # 主平台页面
│   ├── video-detail.html         # 视频详情页
│   └── index.html                # 首页
├── 🎨 样式文件
│   └── css/
│       └── aoyou-medical.css     # 主样式文件
├── 💻 脚本文件
│   └── js/
│       ├── aoyou-medical-*.js    # 功能模块
│       └── main.js               # 主脚本
└── 🖼️ 静态资源
    ├── images/                   # 图片资源
    └── videos/                   # 视频文件
```

## 🎯 核心功能模块

### 1. 邀请码验证系统
**文件**: `aoyou-youtube-style.html` (内嵌JavaScript)  
**功能**: 会话级邀请码验证  

```javascript
// 核心函数
function isVideoAccessVerified() {
    return sessionStorage.getItem('aoyou_video_access_verified') === 'true';
}

function showVideoAccessModal(videoId) {
    // 显示邀请码弹窗
}

function verifyVideoAccess() {
    // 验证邀请码逻辑
}
```

**技术要点**:
- 使用 `sessionStorage` 实现会话级存储
- 关闭浏览器后自动重置验证状态
- 任意数字即可通过验证

### 2. 视频分类系统
**实现位置**: `aoyou-youtube-style.html`  

```javascript
// 视频分类数据
var videoCategories = [
    { id: 'clinical', name: '临床医学', icon: '🩺' },
    { id: 'basic', name: '基础医学', icon: '📚' },
    { id: 'pharmacy', name: '药学治疗', icon: '💊' },
    // ... 更多分类
];
```

### 3. 响应式布局
**CSS框架**: 自定义响应式系统  

```css
/* 移动端适配 */
@media (max-width: 768px) {
    .video-grid {
        grid-template-columns: 1fr;
    }
    
    .header-center {
        display: none;
    }
}
```

## 🎨 UI组件规范

### 颜色系统
```css
:root {
    --primary-color: #4a9eff;      /* 主色调 */
    --secondary-color: #7b68ee;    /* 辅助色 */
    --background-color: #ffffff;   /* 背景色 */
    --text-color: #333333;         /* 文字色 */
    --border-color: #e0e0e0;       /* 边框色 */
}
```

### 字体系统
```css
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                 Roboto, 'Helvetica Neue', Arial, sans-serif;
}
```

### 组件样式
- **按钮**: 圆角8px，渐变背景
- **卡片**: 圆角12px，阴影效果
- **弹窗**: 居中显示，背景遮罩

## 📱 移动端适配

### 触摸优化
```css
.video-card {
    cursor: pointer;
    transition: transform 0.2s;
}

.video-card:hover {
    transform: translateY(-8px);
}

/* 移动端触摸反馈 */
@media (hover: none) {
    .video-card:active {
        transform: scale(0.98);
    }
}
```

### 视口配置
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## 🔧 开发环境配置

### 本地开发服务器
```bash
# Python服务器（推荐）
python3 -m http.server 3000

# Node.js服务器
npx http-server -p 3000
```

### 调试工具
- **邀请码测试**: `invite-code-test.html`
- **错误诊断**: `debug-errors.html`
- **浏览器控制台**: 查看详细日志

## 🧪 测试要求

### 浏览器兼容性
| 浏览器 | 最低版本 | 测试重点 |
|--------|----------|----------|
| Chrome | 70+ | 主要测试浏览器 |
| Safari | 12+ | iOS设备兼容性 |
| Firefox | 65+ | 功能完整性 |
| Edge | 79+ | Windows兼容性 |

### 功能测试清单
- [ ] 邀请码弹窗显示和验证
- [ ] 视频分类切换
- [ ] 响应式布局适配
- [ ] 移动端触摸交互
- [ ] 页面加载性能

### 性能要求
- 首次内容绘制 (FCP) < 2秒
- 页面完全加载 < 5秒
- 移动端友好性评分 > 95

## 🚀 部署说明

### 静态文件部署
```bash
# 上传到服务器
rsync -avz --delete ./ user@server:/var/www/html/

# 或使用GitHub Pages
git push origin main
```

### 服务器配置
```nginx
# Nginx配置示例
server {
    listen 80;
    root /var/www/html;
    index aoyou-youtube-style.html;
    
    # 启用Gzip压缩
    gzip on;
    gzip_types text/css application/javascript;
    
    # 缓存静态资源
    location ~* \.(css|js|png|jpg|jpeg|gif|svg)$ {
        expires 1y;
    }
}
```

## 🔍 常见问题

### Q: 邀请码弹窗不显示？
A: 检查sessionStorage状态，使用 `resetVideoAccess()` 重置

### Q: 移动端样式异常？
A: 检查viewport设置和CSS媒体查询

### Q: 视频无法播放？
A: 确保使用HTTP服务器访问，不是file://协议

## 📚 参考资源

- [HTML5规范](https://html.spec.whatwg.org/)
- [CSS3参考](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [JavaScript ES6+](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [响应式设计指南](https://web.dev/responsive-web-design-basics/)

---

**文档版本**: v1.0  
**更新日期**: 2024年10月21日