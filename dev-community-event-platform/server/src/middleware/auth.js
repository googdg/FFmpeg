const AuthService = require('../services/AuthService');
const User = require('../models/User');
const { 
  AuthenticationError, 
  AuthorizationError 
} = require('./errorHandler');
const { logger } = require('../utils/logger');

// 认证中间件 - 验证JWT令牌
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
    
    // 验证令牌并获取用户信息
    const user = await AuthService.getCurrentUser(token);
    
    // 将用户信息添加到请求对象
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    logger.error('Authentication failed', { 
      error: error.message,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    next(error);
  }
};

// 可选认证中间件 - 如果有令牌则验证，没有则继续
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = await AuthService.getCurrentUser(token);
      req.user = user;
      req.token = token;
    }
    
    next();
  } catch (error) {
    // 可选认证失败时不阻止请求，但记录错误
    logger.warn('Optional authentication failed', { 
      error: error.message,
      ip: req.ip
    });
    next();
  }
};

// 角色授权中间件
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AuthorizationError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      logger.error('Authorization failed', {
        error: error.message,
        userId: req.user?.id,
        userRole: req.user?.role,
        requiredRoles: allowedRoles
      });
      next(error);
    }
  };
};

// 权限检查中间件
const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // 管理员拥有所有权限
      if (req.user.role === 'admin') {
        return next();
      }

      // 从数据库获取用户对象以检查权限
      const user = await User.findById(req.user.id);
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      const hasPermission = await user.hasPermission(permissionName);
      if (!hasPermission) {
        throw new AuthorizationError(
          `Access denied. Required permission: ${permissionName}`
        );
      }

      next();
    } catch (error) {
      logger.error('Permission check failed', {
        error: error.message,
        userId: req.user?.id,
        userRole: req.user?.role,
        requiredPermission: permissionName
      });
      next(error);
    }
  };
};

// 资源所有者检查中间件
const requireOwnership = (resourceIdParam = 'id', userIdField = 'user_id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // 管理员可以访问所有资源
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params[resourceIdParam];
      if (!resourceId) {
        throw new ValidationError(`Resource ID parameter '${resourceIdParam}' is required`);
      }

      // 这里需要根据具体的资源类型来实现所有权检查
      // 暂时跳过，在具体的路由中实现
      next();
    } catch (error) {
      logger.error('Ownership check failed', {
        error: error.message,
        userId: req.user?.id,
        resourceId: req.params[resourceIdParam]
      });
      next(error);
    }
  };
};

// 速率限制中间件（基于用户）
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next();
      }

      const key = `rate_limit:user:${req.user.id}`;
      const { CacheManager } = require('../config/redis');
      
      const current = await CacheManager.incrementRateLimit(key, windowMs / 1000);
      
      if (current > maxRequests) {
        throw new RateLimitError(
          `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds`
        );
      }

      // 添加速率限制头部
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - current),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

// 验证邮箱中间件
const requireEmailVerification = (req, res, next) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (!req.user.emailVerified) {
      throw new AuthorizationError('Email verification required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// 账户状态检查中间件
const requireActiveAccount = (req, res, next) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (!req.user.isActive) {
      throw new AuthorizationError('Account is inactive');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// 获取客户端信息的辅助函数
const getClientInfo = (req) => {
  return {
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent') || 'Unknown'
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  requirePermission,
  requireOwnership,
  userRateLimit,
  requireEmailVerification,
  requireActiveAccount,
  getClientInfo
};