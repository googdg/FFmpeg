# 开发者社区活动管理平台

一个专为技术社区设计的全流程活动管理平台，集成直播、AI处理、多语言支持等先进功能。

## 🚀 核心特性

### 📅 活动管理
- 完整的活动生命周期管理
- 在线报名和签到系统
- 嘉宾管理和议程安排
- 参与者数据导出

### 📺 实时直播
- WebRTC高质量直播
- 多路摄像头切换
- 屏幕共享支持
- 自动录像保存

### 🤖 AI智能处理
- 实时语音转文字
- 智能内容总结
- 思维导图生成
- 视频智能分段

### 🌍 多语言支持
- 中英文双语界面
- 实时内容翻译
- 国际化技术社区支持

### 📚 内容归档
- 智能内容归档
- 多维度搜索
- 知识库构建
- 版本管理

### 🔒 安全可靠
- 企业级安全保障
- 数据加密传输
- 完善的备份恢复
- 实时监控预警

## 🏗️ 技术架构

### 后端技术栈
- **运行时**: Node.js 18+ + Express.js
- **数据库**: PostgreSQL + Redis
- **认证**: JWT + bcryptjs
- **实时通信**: Socket.io + WebRTC
- **AI服务**: OpenAI GPT-4 + Whisper
- **容器化**: Docker + Kubernetes

### 前端技术栈
- **框架**: React 18 + Next.js + TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand + React Query
- **实时通信**: Socket.io Client
- **PWA**: Service Worker

## 🚀 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Docker (可选)

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd dev-community-event-platform
```

2. **安装依赖**
```bash
# 安装根目录依赖
npm install

# 安装服务端依赖
cd server && npm install

# 安装客户端依赖
cd ../client && npm install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
vim .env
```

4. **启动数据库服务**
```bash
# 使用Docker启动PostgreSQL和Redis
docker-compose up postgres redis -d
```

5. **运行数据库迁移**
```bash
cd server && npm run db:migrate
```

6. **启动开发服务器**
```bash
# 从根目录启动所有服务
npm run dev
```

访问应用：
- 前端: http://localhost:3000
- 后端API: http://localhost:8000/api
- 健康检查: http://localhost:8000/health

### Docker部署

1. **构建并启动所有服务**
```bash
docker-compose up -d
```

2. **启动包含监控的完整服务**
```bash
docker-compose --profile monitoring up -d
```

3. **启动包含流媒体的服务**
```bash
docker-compose --profile streaming up -d
```

## 📖 API文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新令牌
- `GET /api/auth/me` - 获取当前用户

### 活动接口
- `GET /api/events` - 获取活动列表
- `POST /api/events` - 创建活动
- `GET /api/events/:id` - 获取活动详情
- `PUT /api/events/:id` - 更新活动
- `DELETE /api/events/:id` - 删除活动
- `POST /api/events/:id/register` - 活动报名

### 用户接口
- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户信息
- `DELETE /api/users/:id` - 删除用户

## 🧪 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 运行服务端测试
cd server && npm test

# 运行客户端测试
cd client && npm test

# 生成测试覆盖率报告
npm run test:coverage
```

### 测试策略
- **单元测试**: Jest + Supertest
- **属性测试**: fast-check
- **集成测试**: 端到端流程测试
- **性能测试**: 负载和压力测试

## 📊 监控

### 健康检查
```bash
curl http://localhost:8000/health
```

### 监控面板
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

### 日志
- 应用日志: `logs/combined.log`
- 错误日志: `logs/error.log`

## 🔧 配置

### 环境变量
详细的环境变量配置请参考 `.env.example` 文件。

### 数据库配置
```javascript
// server/src/config/database.js
const dbConfig = {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD
};
```

### Redis配置
```javascript
// server/src/config/redis.js
const redisConfig = {
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 5000,
    lazyConnect: true
  }
};
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- 使用 ESLint 和 Prettier
- 遵循 TypeScript 严格模式
- 编写测试用例
- 更新文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [OpenAI](https://openai.com/) - AI服务支持
- [Google Developer Community](https://developers.google.com/community) - 项目灵感来源
- 所有贡献者和社区成员

## 📞 联系我们

- 项目主页: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 邮箱: contact@dev-community-platform.com

---

**开发者社区活动管理平台** - 让技术活动管理变得更简单、更高效！