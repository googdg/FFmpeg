const { logger } = require('../utils/logger');

// 自定义错误类
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// 验证错误类
class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

// 认证错误类
class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

// 授权错误类
class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

// 资源未找到错误类
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

// 冲突错误类
class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

// 速率限制错误类
class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

// 全局错误处理中间件
function errorHandler(error, req, res, next) {
  let err = { ...error };
  err.message = error.message;

  // 记录错误日志
  logger.error('Error Handler', {
    error: err.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.body,
    params: req.params,
    query: req.query
  });

  // PostgreSQL错误处理
  if (error.code === '23505') {
    // 唯一约束违反
    const message = 'Duplicate field value entered';
    err = new ConflictError(message);
  } else if (error.code === '23503') {
    // 外键约束违反
    const message = 'Referenced resource not found';
    err = new ValidationError(message);
  } else if (error.code === '23502') {
    // 非空约束违反
    const message = 'Required field is missing';
    err = new ValidationError(message);
  }

  // JWT错误处理
  if (error.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    err = new AuthenticationError(message);
  } else if (error.name === 'TokenExpiredError') {
    const message = 'Token expired';
    err = new AuthenticationError(message);
  }

  // Multer错误处理
  if (error.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    err = new ValidationError(message);
  } else if (error.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files';
    err = new ValidationError(message);
  }

  // 验证错误处理
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map(val => val.message).join(', ');
    err = new ValidationError(message);
  }

  // 默认错误处理
  if (!err.isOperational) {
    err = new AppError('Something went wrong', 500, 'INTERNAL_ERROR');
  }

  // 构建错误响应
  const errorResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack
      })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // 添加字段信息（如果是验证错误）
  if (err instanceof ValidationError && err.field) {
    errorResponse.error.field = err.field;
  }

  res.status(err.statusCode || 500).json(errorResponse);
}

// 异步错误处理包装器
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 404处理中间件
function notFoundHandler(req, res, next) {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  errorHandler,
  asyncHandler,
  notFoundHandler
};