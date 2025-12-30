# AWS开发者社区活动管理系统 - 设计文档

## 系统架构设计

### 整体架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 H5 应用   │    │   后端 API      │    │   数据存储       │
│                │    │                │    │                │
│ - 活动管理界面   │◄──►│ - Express.js    │◄──►│ - SQLite       │
│ - 报名表单      │    │ - RESTful API   │    │ - 文件存储      │
│ - 签到界面      │    │ - JWT 认证      │    │ - 图片存储      │
│ - 照片上传      │    │ - 文件处理      │    │                │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技术栈选择

#### 前端技术
- **HTML5**: 语义化标签，移动端优化
- **CSS3**: Flexbox/Grid布局，响应式设计
- **JavaScript ES6+**: 模块化开发，异步处理
- **Service Worker**: PWA支持，离线功能

#### 后端技术
- **Node.js**: 高性能JavaScript运行时
- **Express.js**: 轻量级Web框架
- **SQLite**: 轻量级关系数据库
- **Multer**: 文件上传处理
- **JWT**: 无状态身份认证

## 数据库设计

### 数据表结构

#### 1. 活动表 (events)
```sql
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(500) NOT NULL,
    speaker_name VARCHAR(100),
    speaker_title VARCHAR(100),
    speaker_company VARCHAR(100),
    speaker_bio TEXT,
    speaker_avatar VARCHAR(255),
    max_attendees INTEGER DEFAULT 100,
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, ongoing, completed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. 报名表 (registrations)
```sql
CREATE TABLE registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    age INTEGER,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'registered', -- registered, checked_in, cancelled
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);
```

#### 3. 签到表 (checkins)
```sql
CREATE TABLE checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_id INTEGER NOT NULL,
    checked_in_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    checked_by VARCHAR(100),
    FOREIGN KEY (registration_id) REFERENCES registrations(id)
);
```

#### 4. 照片表 (photos)
```sql
CREATE TABLE photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    description TEXT,
    file_size INTEGER,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);
```

#### 5. 活动总结表 (summaries)
```sql
CREATE TABLE summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);
```

#### 6. 管理员表 (admins)
```sql
CREATE TABLE admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API设计

### RESTful API端点

#### 认证相关
```
POST /api/auth/login          # 管理员登录
POST /api/auth/logout         # 登出
GET  /api/auth/profile        # 获取当前用户信息
```

#### 活动管理
```
GET    /api/events            # 获取活动列表
POST   /api/events            # 创建新活动
GET    /api/events/:id        # 获取活动详情
PUT    /api/events/:id        # 更新活动信息
DELETE /api/events/:id        # 删除活动
PUT    /api/events/:id/status # 更新活动状态
```

#### 报名管理
```
GET    /api/events/:id/registrations     # 获取活动报名列表
POST   /api/events/:id/registrations     # 提交报名
GET    /api/registrations/:id            # 获取报名详情
PUT    /api/registrations/:id            # 更新报名信息
DELETE /api/registrations/:id            # 取消报名
GET    /api/events/:id/registrations/export # 导出报名数据
```

#### 签到管理
```
GET    /api/events/:id/checkins          # 获取签到列表
POST   /api/registrations/:id/checkin    # 执行签到
GET    /api/events/:id/checkin-stats     # 获取签到统计
```

#### 照片管理
```
GET    /api/events/:id/photos            # 获取活动照片
POST   /api/events/:id/photos            # 上传照片
DELETE /api/photos/:id                   # 删除照片
PUT    /api/photos/:id                   # 更新照片信息
```

#### 活动总结
```
GET    /api/events/:id/summary           # 获取活动总结
POST   /api/events/:id/summary           # 创建活动总结
PUT    /api/events/:id/summary           # 更新活动总结
```

### API响应格式
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-11-12T10:00:00Z"
}
```

## 前端架构设计

### 页面结构
```
├── index.html              # 主页/活动列表
├── event-detail.html       # 活动详情页
├── event-form.html         # 活动创建/编辑
├── registration.html       # 报名页面
├── checkin.html           # 签到页面
├── photos.html            # 照片管理
├── summary.html           # 活动总结
└── admin-login.html       # 管理员登录
```

### JavaScript模块设计
```
├── js/
│   ├── app.js                    # 主应用入口
│   ├── api-client.js             # API客户端
│   ├── auth-manager.js           # 认证管理
│   ├── event-manager.js          # 活动管理
│   ├── registration-manager.js   # 报名管理
│   ├── checkin-manager.js        # 签到管理
│   ├── photo-manager.js          # 照片管理
│   ├── summary-manager.js        # 总结管理
│   ├── ui-components.js          # UI组件
│   ├── utils.js                  # 工具函数
│   └── sw.js                     # Service Worker
```

### CSS架构
```
├── css/
│   ├── main.css              # 全局样式
│   ├── components.css        # 组件样式
│   ├── pages.css            # 页面样式
│   ├── mobile.css           # 移动端样式
│   └── print.css            # 打印样式
```

## UI/UX设计

### 设计原则
1. **移动优先**: 针对手机端优化设计
2. **简洁直观**: 减少认知负担，操作简单
3. **一致性**: 统一的视觉语言和交互模式
4. **可访问性**: 支持无障碍访问

### 色彩方案
```css
:root {
  --primary-color: #FF9900;      /* AWS橙色 */
  --secondary-color: #232F3E;    /* AWS深蓝 */
  --accent-color: #146EB4;       /* AWS蓝色 */
  --success-color: #16A085;      /* 成功绿 */
  --warning-color: #F39C12;      /* 警告橙 */
  --error-color: #E74C3C;        /* 错误红 */
  --text-primary: #2C3E50;       /* 主文本 */
  --text-secondary: #7F8C8D;     /* 次要文本 */
  --background: #FFFFFF;         /* 背景白 */
  --surface: #F8F9FA;           /* 表面灰 */
}
```

### 组件设计

#### 1. 导航栏
- AWS品牌标识
- 用户状态显示
- 主要功能入口

#### 2. 活动卡片
- 活动标题和时间
- 地点和嘉宾信息
- 报名状态和操作按钮

#### 3. 表单组件
- 统一的输入框样式
- 清晰的错误提示
- 友好的验证反馈

#### 4. 数据展示
- 统计卡片
- 列表视图
- 状态标签

### 响应式设计

#### 断点设置
```css
/* 移动端 */
@media (max-width: 768px) { }

/* 平板端 */
@media (min-width: 769px) and (max-width: 1024px) { }

/* 桌面端 */
@media (min-width: 1025px) { }
```

#### 布局适配
- 移动端: 单列布局，大按钮，易点击
- 平板端: 两列布局，适中间距
- 桌面端: 多列布局，丰富信息展示

## 安全设计

### 身份认证
- JWT Token认证
- Token过期机制
- 刷新Token策略

### 数据验证
- 前端表单验证
- 后端数据校验
- SQL注入防护

### 文件上传安全
- 文件类型检查
- 文件大小限制
- 文件名安全处理
- 病毒扫描 (可选)

### XSS防护
- 输入内容转义
- CSP策略设置
- 安全的DOM操作

## 性能优化

### 前端优化
- 代码分割和懒加载
- 图片压缩和WebP支持
- CSS/JS压缩
- Service Worker缓存

### 后端优化
- 数据库索引优化
- API响应缓存
- 文件压缩传输
- 连接池管理

### 图片处理
- 自动压缩上传图片
- 生成多种尺寸缩略图
- WebP格式支持
- CDN分发 (可选)

## 部署架构

### 开发环境
```
├── 前端开发服务器 (Live Server)
├── 后端开发服务器 (nodemon)
└── SQLite数据库文件
```

### 生产环境
```
├── Nginx (反向代理 + 静态文件)
├── Node.js应用 (PM2管理)
├── SQLite数据库
└── 文件存储目录
```

### Docker部署 (可选)
```dockerfile
# 多阶段构建
FROM node:16-alpine AS builder
# 构建应用

FROM node:16-alpine AS runtime
# 运行应用
```

## 监控和日志

### 应用监控
- 系统性能监控
- API响应时间
- 错误率统计
- 用户行为分析

### 日志管理
- 访问日志
- 错误日志
- 操作审计日志
- 性能日志

## 扩展性设计

### 水平扩展
- 无状态应用设计
- 数据库读写分离
- 负载均衡支持

### 功能扩展
- 插件化架构
- 配置化管理
- API版本控制
- 第三方集成接口

## 测试策略

### 单元测试
- 核心业务逻辑测试
- API接口测试
- 数据库操作测试

### 集成测试
- 端到端流程测试
- API集成测试
- 文件上传测试

### 用户测试
- 可用性测试
- 性能测试
- 兼容性测试