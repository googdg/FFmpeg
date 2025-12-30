const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFoundHandler');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');

class Server {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.CLIENT_BASE_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    this.port = process.env.PORT || 8000;
  }

  async initialize() {
    try {
      // 连接数据库
      await connectDatabase();
      logger.info('Database connected successfully');

      // 连接Redis
      await connectRedis();
      logger.info('Redis connected successfully');

      // 设置中间件
      this.setupMiddleware();

      // 设置路由
      this.setupRoutes();

      // 设置Socket.IO
      this.setupSocketIO();

      // 设置错误处理
      this.setupErrorHandling();

      logger.info('Server initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize server:', error);
      process.exit(1);
    }
  }

  setupMiddleware() {
    // 安全中间件
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    }));

    // CORS配置
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // 压缩响应
    this.app.use(compression());

    // 请求日志
    this.app.use(morgan('combined', {
      stream: { write: message => logger.info(message.trim()) }
    }));

    // 解析请求体
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 会话管理
    this.app.use(session({
      secret: process.env.SESSION_SECRET || 'dev-community-platform-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24小时
      }
    }));

    // 速率限制
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100, // 限制每个IP 15分钟内最多100个请求
      message: {
        error: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // 登录速率限制
    const loginLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 5, // 限制每个IP 15分钟内最多5次登录尝试
      message: {
        error: 'Too many login attempts from this IP, please try again later.'
      },
      skipSuccessfulRequests: true,
    });
    this.app.use('/api/auth/login', loginLimiter);
  }

  setupRoutes() {
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // API路由
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/events', eventRoutes);
    this.app.use('/api/users', userRoutes);

    // 静态文件服务
    this.app.use('/uploads', express.static('uploads'));

    // API文档
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'Dev Community Event Platform API',
        version: '1.0.0',
        description: '开发者社区活动管理平台API',
        endpoints: {
          auth: '/api/auth',
          events: '/api/events',
          users: '/api/users',
          health: '/health'
        }
      });
    });
  }

  setupSocketIO() {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // 加入活动房间
      socket.on('join-event', (eventId) => {
        socket.join(`event-${eventId}`);
        logger.info(`Client ${socket.id} joined event ${eventId}`);
      });

      // 离开活动房间
      socket.on('leave-event', (eventId) => {
        socket.leave(`event-${eventId}`);
        logger.info(`Client ${socket.id} left event ${eventId}`);
      });

      // 直播相关事件
      socket.on('stream-start', (data) => {
        socket.to(`event-${data.eventId}`).emit('stream-started', data);
      });

      socket.on('stream-stop', (data) => {
        socket.to(`event-${data.eventId}`).emit('stream-stopped', data);
      });

      // 实时转录事件
      socket.on('transcription-update', (data) => {
        socket.to(`event-${data.eventId}`).emit('transcription-received', data);
      });

      // 断开连接
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  setupErrorHandling() {
    // 404处理
    this.app.use(notFoundHandler);

    // 全局错误处理
    this.app.use(errorHandler);

    // 未捕获的异常处理
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  async start() {
    await this.initialize();
    
    this.server.listen(this.port, () => {
      logger.info(`Server running on port ${this.port}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API Base URL: http://localhost:${this.port}/api`);
    });
  }
}

// 启动服务器
const server = new Server();
server.start().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = { Server };