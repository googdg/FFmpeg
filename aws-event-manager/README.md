# 🚗 AWS开发者社区活动管理系统

## 📋 项目简介

这是一个专为AWS开发者社区设计的H5活动管理系统MVP版本，支持活动策划、宣传、报名、签到和总结的全流程管理。

### ✨ 核心功能

- **活动管理** - 创建、编辑、发布活动，支持嘉宾信息管理
- **报名系统** - 用户友好的报名表单，防重复报名，数据导出
- **现场签到** - 快速搜索签到，实时统计，移动端优化
- **照片管理** - 批量上传，自动压缩，照片展示
- **活动总结** - 富文本编辑，数据统计，内容发布
- **PWA支持** - 离线功能，移动端体验，推送通知

### 🎯 目标用户

- **主要用户**: AWS社区组织者
- **参会用户**: 开发者群体
- **管理员**: 社区管理团队

## 🚀 快速开始

### 环境要求

- Node.js 16+
- npm 7+
- 现代浏览器 (Chrome 90+, Safari 14+, Firefox 88+)

### 安装和启动

```bash
# 1. 克隆项目
git clone <repository-url>
cd aws-event-manager

# 2. 一键启动
./start.sh
```

启动脚本会自动：
- 检查环境依赖
- 安装npm包
- 创建必要目录
- 配置环境变量
- 启动开发服务器

### 手动安装

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 启动开发服务器
npm run dev

# 或启动生产服务器
npm start
```

## 📱 使用指南

### 管理员使用

1. **登录系统**
   - 访问: http://localhost:3000
   - 默认账户: admin / admin123

2. **创建活动**
   - 点击"创建活动"按钮
   - 填写活动信息（标题、时间、地点、嘉宾等）
   - 保存并发布活动

3. **管理报名**
   - 切换到"报名管理"页面
   - 选择活动查看报名列表
   - 导出报名数据

4. **现场签到**
   - 切换到"现场签到"页面
   - 选择活动
   - 搜索参会者姓名或手机号
   - 一键签到

5. **照片管理**
   - 切换到"照片管理"页面
   - 选择活动
   - 批量上传活动照片

### 参会者使用

1. **活动报名**
   - 访问报名链接: http://localhost:3000/registration.html?event=活动ID
   - 填写报名信息
   - 提交报名

2. **查看活动信息**
   - 报名页面显示完整活动信息
   - 包括时间、地点、嘉宾介绍等

## 🏗️ 技术架构

### 后端技术栈

- **运行时**: Node.js 16+ + Express.js
- **数据库**: SQLite + sqlite3
- **认证**: JWT + bcryptjs
- **文件上传**: Multer + Sharp (图片压缩)
- **安全**: Helmet + CORS + 速率限制

### 前端技术栈

- **核心**: HTML5 + CSS3 + ES6+ JavaScript
- **架构**: 模块化设计 + 服务导向
- **PWA**: Service Worker + Web App Manifest
- **响应式**: 移动端优先设计

### 数据库设计

```sql
-- 活动表
events (id, title, description, event_date, event_time, location, speaker_info, max_attendees, status)

-- 报名表
registrations (id, event_id, name, company, position, phone, email, notes, status)

-- 签到表
checkins (id, registration_id, checked_in_at, checked_by)

-- 照片表
photos (id, event_id, filename, description, uploaded_at)

-- 总结表
summaries (id, event_id, content, published_at)

-- 管理员表
admins (id, username, password_hash, email)
```

## 📁 项目结构

```
aws-event-manager/
├── server.js                 # Express服务器
├── package.json              # 项目配置
├── start.sh                  # 启动脚本
├── ecosystem.config.js       # PM2配置
├── .env.example              # 环境变量模板
├── public/                   # 前端静态文件
│   ├── index.html           # 管理后台
│   ├── registration.html    # 报名页面
│   ├── css/                 # 样式文件
│   │   ├── main.css        # 主样式
│   │   └── components.css  # 组件样式
│   ├── js/                  # JavaScript文件
│   │   ├── app.js          # 主应用
│   │   ├── api-client.js   # API客户端
│   │   └── utils.js        # 工具函数
│   ├── sw.js               # Service Worker
│   └── manifest.json       # PWA配置
├── uploads/                 # 上传文件目录
├── logs/                    # 日志目录
└── event-manager.db         # SQLite数据库
```

## 🔧 配置说明

### 环境变量

复制 `.env.example` 到 `.env` 并根据需要修改：

```bash
# 基础配置
PORT=3000
NODE_ENV=development

# 安全密钥 (生产环境必须修改)
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# 文件上传
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_DIR=./uploads

# 可选配置
SMTP_HOST=smtp.gmail.com  # 邮件服务
WECHAT_APP_ID=your-id     # 微信集成
```

### 数据库

系统使用SQLite数据库，首次启动时会自动创建：
- 数据库文件: `event-manager.db`
- 自动创建表结构
- 创建默认管理员账户

### 文件上传

- 上传目录: `uploads/`
- 支持格式: JPEG, PNG, GIF, WebP
- 自动压缩: 最大1200x800像素
- 大小限制: 5MB

## 🚀 部署指南

### 开发环境

```bash
npm run dev
```

### 生产环境

```bash
# 使用PM2部署
npm run pm2:start

# 或直接启动
NODE_ENV=production PORT=80 npm start
```

### Docker部署

```bash
# 构建镜像
docker build -t aws-event-manager .

# 运行容器
docker run -p 3000:3000 aws-event-manager
```

### Nginx配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /uploads/ {
        alias /path/to/uploads/;
        expires 30d;
    }
}
```

## 📊 API文档

### 认证接口

```bash
POST /api/auth/login      # 登录
GET  /api/auth/profile    # 获取用户信息
```

### 活动管理

```bash
GET    /api/events        # 获取活动列表
POST   /api/events        # 创建活动
GET    /api/events/:id    # 获取活动详情
PUT    /api/events/:id    # 更新活动
PUT    /api/events/:id/status  # 更新活动状态
```

### 报名管理

```bash
GET  /api/events/:id/registrations     # 获取报名列表
POST /api/events/:id/registrations     # 提交报名
POST /api/registrations/:id/checkin    # 签到
GET  /api/events/:id/checkin-stats     # 签到统计
```

### 照片管理

```bash
GET  /api/events/:id/photos    # 获取照片列表
POST /api/events/:id/photos    # 上传照片
```

## 🧪 测试

```bash
# 运行测试
npm test

# 功能测试
npm run test:integration

# 性能测试
npm run test:performance
```

## 📈 监控和日志

### 日志文件

- 应用日志: `logs/app.log`
- 错误日志: `logs/error.log`
- 访问日志: `logs/access.log`

### 监控指标

- 响应时间
- 错误率
- 内存使用
- 数据库性能

## 🔒 安全特性

- JWT身份认证
- 密码哈希存储
- CSRF防护
- XSS防护
- 速率限制
- 文件上传安全检查
- SQL注入防护

## 🎨 自定义配置

### 主题颜色

修改 `public/css/main.css` 中的CSS变量：

```css
:root {
    --primary-color: #FF9900;    /* AWS橙色 */
    --secondary-color: #232F3E;  /* AWS深蓝 */
    --accent-color: #146EB4;     /* AWS蓝色 */
}
```

### 品牌标识

替换 `public/images/` 目录中的图片文件：
- `aws-logo.png` - 导航栏Logo
- `icon-192.png` - PWA图标
- `icon-512.png` - PWA图标

## 🐛 故障排除

### 常见问题

**Q: 启动时提示端口被占用**
```bash
# 查看端口占用
lsof -i :3000
# 修改端口
export PORT=3001
```

**Q: 数据库连接失败**
```bash
# 检查数据库文件权限
ls -la event-manager.db
# 重新创建数据库
rm event-manager.db && npm start
```

**Q: 文件上传失败**
```bash
# 检查上传目录权限
mkdir -p uploads && chmod 755 uploads
```

**Q: 前端页面空白**
```bash
# 检查静态文件服务
curl http://localhost:3000/css/main.css
```

### 调试模式

```bash
# 启用调试日志
DEBUG=* npm run dev

# 查看详细错误
NODE_ENV=development npm start
```

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 支持

- 📧 邮箱: support@aws-community.com
- 💬 微信群: 扫码加入AWS开发者社区
- 🐛 问题反馈: [GitHub Issues](https://github.com/your-repo/issues)

## 🗺️ 路线图

### v1.1 (下个版本)
- [ ] 微信小程序支持
- [ ] 二维码签到
- [ ] 邮件通知
- [ ] 数据分析仪表板

### v1.2 (未来版本)
- [ ] 多社区支持
- [ ] 权限管理系统
- [ ] 活动模板
- [ ] 第三方集成

### v2.0 (长期规划)
- [ ] 移动端APP
- [ ] 实时聊天
- [ ] 直播集成
- [ ] AI智能推荐

---

**感谢使用AWS开发者社区活动管理系统！** 🎉

如果这个项目对您有帮助，请给我们一个⭐️