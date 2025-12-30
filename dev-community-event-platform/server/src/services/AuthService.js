const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/database');
const { CacheManager } = require('../config/redis');
const User = require('../models/User');
const { 
  AuthenticationError, 
  ValidationError, 
  NotFoundError 
} = require('../middleware/errorHandler');
const { logger, auditLog } = require('../utils/logger');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'dev-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshTokenExpiresIn = '7d';
  }

  // 生成JWT令牌
  generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'dev-community-platform',
      audience: 'dev-community-users'
    });

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      this.jwtSecret,
      {
        expiresIn: this.refreshTokenExpiresIn,
        issuer: 'dev-community-platform',
        audience: 'dev-community-users'
      }
    );

    return { accessToken, refreshToken };
  }

  // 验证JWT令牌
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: 'dev-community-platform',
        audience: 'dev-community-users'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new AuthenticationError('Invalid token');
      }
      throw error;
    }
  }

  // 生成安全的随机令牌
  generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // 创建用户会话
  async createSession(user, { ipAddress, userAgent }) {
    const { accessToken, refreshToken } = this.generateTokens(user);
    
    // 哈希令牌用于存储
    const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    // 计算过期时间
    const expiresAt = new Date(Date.now() + this.parseTimeToMs(this.jwtExpiresIn));
    const refreshExpiresAt = new Date(Date.now() + this.parseTimeToMs(this.refreshTokenExpiresIn));

    // 存储会话到数据库
    await query(`
      INSERT INTO user_sessions (
        user_id, token_hash, refresh_token_hash, 
        expires_at, refresh_expires_at, ip_address, user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      user.id, tokenHash, refreshTokenHash,
      expiresAt, refreshExpiresAt, ipAddress, userAgent
    ]);

    // 缓存用户信息
    await CacheManager.set(`user:${user.id}`, user.toJSON(), 3600);

    return { accessToken, refreshToken, expiresAt };
  }

  // 用户注册
  async register(userData, { ipAddress, userAgent }) {
    try {
      // 创建用户
      const user = await User.create(userData);

      // 记录注册日志
      auditLog('user.register', user.id, {
        email: user.email,
        role: user.role,
        ipAddress
      });

      // 创建会话
      const session = await this.createSession(user, { ipAddress, userAgent });

      return {
        user: user.toJSON(),
        ...session
      };
    } catch (error) {
      logger.error('Registration failed', { error: error.message, userData: { email: userData.email } });
      throw error;
    }
  }

  // 用户登录
  async login(email, password, { ipAddress, userAgent }) {
    try {
      // 查找用户
      const user = await User.findByEmail(email);
      if (!user) {
        await this.logLoginAttempt(null, ipAddress, userAgent, false, 'User not found');
        throw new AuthenticationError('Invalid credentials');
      }

      // 验证密码
      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        await this.logLoginAttempt(user.id, ipAddress, userAgent, false, 'Invalid password');
        throw new AuthenticationError('Invalid credentials');
      }

      // 检查账户状态
      if (!user.isActive) {
        await this.logLoginAttempt(user.id, ipAddress, userAgent, false, 'Account inactive');
        throw new AuthenticationError('Account is inactive');
      }

      // 更新最后登录时间
      await user.updateLastLogin();

      // 记录成功登录
      await this.logLoginAttempt(user.id, ipAddress, userAgent, true);

      // 创建会话
      const session = await this.createSession(user, { ipAddress, userAgent });

      auditLog('user.login', user.id, { ipAddress });

      return {
        user: user.toJSON(),
        ...session
      };
    } catch (error) {
      logger.error('Login failed', { error: error.message, email });
      throw error;
    }
  }

  // 刷新令牌
  async refreshToken(refreshToken, { ipAddress, userAgent }) {
    try {
      // 验证刷新令牌
      const decoded = this.verifyToken(refreshToken);
      
      if (decoded.type !== 'refresh') {
        throw new AuthenticationError('Invalid refresh token');
      }

      // 查找用户
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new AuthenticationError('User not found or inactive');
      }

      // 验证会话是否存在且有效
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const sessionResult = await query(`
        SELECT * FROM user_sessions 
        WHERE user_id = $1 AND refresh_token_hash = $2 
        AND refresh_expires_at > NOW() AND is_active = true
      `, [user.id, refreshTokenHash]);

      if (sessionResult.rows.length === 0) {
        throw new AuthenticationError('Invalid or expired refresh token');
      }

      // 生成新的令牌
      const newTokens = this.generateTokens(user);
      const newTokenHash = crypto.createHash('sha256').update(newTokens.accessToken).digest('hex');
      const newRefreshTokenHash = crypto.createHash('sha256').update(newTokens.refreshToken).digest('hex');
      
      const expiresAt = new Date(Date.now() + this.parseTimeToMs(this.jwtExpiresIn));
      const refreshExpiresAt = new Date(Date.now() + this.parseTimeToMs(this.refreshTokenExpiresIn));

      // 更新会话
      await query(`
        UPDATE user_sessions 
        SET token_hash = $1, refresh_token_hash = $2, 
            expires_at = $3, refresh_expires_at = $4,
            ip_address = $5, user_agent = $6
        WHERE id = $7
      `, [
        newTokenHash, newRefreshTokenHash,
        expiresAt, refreshExpiresAt,
        ipAddress, userAgent,
        sessionResult.rows[0].id
      ]);

      return {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        expiresAt
      };
    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      throw error;
    }
  }

  // 用户登出
  async logout(token) {
    try {
      const decoded = this.verifyToken(token);
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // 使会话失效
      await query(`
        UPDATE user_sessions 
        SET is_active = false 
        WHERE user_id = $1 AND token_hash = $2
      `, [decoded.userId, tokenHash]);

      // 清除缓存
      await CacheManager.del(`user:${decoded.userId}`);

      auditLog('user.logout', decoded.userId);
      
      return true;
    } catch (error) {
      logger.error('Logout failed', { error: error.message });
      throw error;
    }
  }

  // 登出所有会话
  async logoutAll(userId) {
    try {
      // 使所有会话失效
      await query(`
        UPDATE user_sessions 
        SET is_active = false 
        WHERE user_id = $1
      `, [userId]);

      // 清除缓存
      await CacheManager.del(`user:${userId}`);

      auditLog('user.logout_all', userId);
      
      return true;
    } catch (error) {
      logger.error('Logout all failed', { error: error.message, userId });
      throw error;
    }
  }

  // 验证当前用户
  async getCurrentUser(token) {
    try {
      const decoded = this.verifyToken(token);
      
      // 先从缓存获取
      let user = await CacheManager.get(`user:${decoded.userId}`);
      
      if (!user) {
        // 从数据库获取
        const userObj = await User.findById(decoded.userId);
        if (!userObj || !userObj.isActive) {
          throw new AuthenticationError('User not found or inactive');
        }
        
        user = userObj.toJSON();
        // 缓存用户信息
        await CacheManager.set(`user:${decoded.userId}`, user, 3600);
      }

      return user;
    } catch (error) {
      logger.error('Get current user failed', { error: error.message });
      throw error;
    }
  }

  // 记录登录尝试
  async logLoginAttempt(userId, ipAddress, userAgent, success, failureReason = null) {
    try {
      await query(`
        INSERT INTO user_login_logs (user_id, ip_address, user_agent, login_success, failure_reason)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, ipAddress, userAgent, success, failureReason]);
    } catch (error) {
      logger.error('Failed to log login attempt', error);
    }
  }

  // 获取用户会话列表
  async getUserSessions(userId) {
    const result = await query(`
      SELECT id, ip_address, user_agent, created_at, expires_at, is_active
      FROM user_sessions
      WHERE user_id = $1 AND expires_at > NOW()
      ORDER BY created_at DESC
    `, [userId]);

    return result.rows;
  }

  // 撤销特定会话
  async revokeSession(userId, sessionId) {
    const result = await query(`
      UPDATE user_sessions 
      SET is_active = false 
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [sessionId, userId]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Session');
    }

    auditLog('session.revoke', userId, { sessionId });
    return true;
  }

  // 清理过期会话
  async cleanupExpiredSessions() {
    const result = await query(`
      DELETE FROM user_sessions 
      WHERE expires_at < NOW() OR refresh_expires_at < NOW()
    `);

    logger.info(`Cleaned up ${result.rowCount} expired sessions`);
    return result.rowCount;
  }

  // 解析时间字符串为毫秒
  parseTimeToMs(timeStr) {
    const units = {
      's': 1000,
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000
    };

    const match = timeStr.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid time format: ${timeStr}`);
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }
}

module.exports = new AuthService();