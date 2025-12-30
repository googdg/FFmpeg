import jwt from 'jsonwebtoken';
import { User, UserData } from '../models/User';
import { MockUser } from '../models/MockUser';
import { IUser } from '../interfaces/IUser';
import { cacheService } from './CacheService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  native_language?: string;
  learning_language?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: Partial<UserData>;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  type: 'access' | 'refresh';
}

export class AuthService {
  private userModel: IUser;
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private refreshTokenExpiresIn: string;

  constructor() {
    // 在开发环境中使用模拟用户，生产环境使用真实数据库
    const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';
    const dbRequired = process.env.DB_REQUIRED === 'true';
    
    this.userModel = isDevelopment && !dbRequired 
      ? new MockUser() 
      : new User();
      
    console.log(`🔧 Using ${isDevelopment && !dbRequired ? 'MockUser' : 'User'} for authentication`);
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  /**
   * 用户注册
   */
  async register(registerData: RegisterData): Promise<{ user: UserData; message: string }> {
    try {
      // 验证输入数据
      this.validateRegisterData(registerData);

      // 创建用户
      const user = await this.userModel.create(registerData);

      // 发送验证邮件（这里只是模拟，实际需要集成邮件服务）
      await this.sendVerificationEmail(user.email, user.verification_token!);

      // 返回用户信息（不包含敏感信息）
      const { password_hash, verification_token, ...safeUser } = user;

      return {
        user: safeUser,
        message: 'Registration successful. Please check your email to verify your account.'
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Registration failed: ${error.message}`);
      }
      throw new Error('Registration failed: Unknown error');
    }
  }

  /**
   * 用户登录
   */
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      const { email, password } = credentials;

      // 查找用户
      const user = await this.userModel.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // 验证密码
      const isValidPassword = await this.userModel.validatePassword(password, user.password_hash!);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // 检查邮箱是否已验证
      if (!user.is_verified) {
        throw new Error('Please verify your email before logging in');
      }

      // 生成令牌
      const tokens = await this.generateTokens(user);

      // 缓存用户会话
      await this.cacheUserSession(user.id!, {
        userId: user.id,
        email: user.email,
        username: user.username,
        lastLogin: new Date()
      });

      return tokens;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('Login failed: Unknown error');
    }
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // 验证刷新令牌
      const payload = this.verifyToken(refreshToken) as JWTPayload;
      
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // 检查用户是否存在
      const user = await this.userModel.findById(payload.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 生成新的令牌
      return await this.generateTokens(user);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Token refresh failed: ${error.message}`);
      }
      throw new Error('Token refresh failed: Unknown error');
    }
  }

  /**
   * 用户登出
   */
  async logout(userId: string): Promise<void> {
    try {
      // 清除用户会话缓存
      await cacheService.deleteUserSession(userId);
      
      // 在实际应用中，可能还需要将令牌加入黑名单
      console.log(`User ${userId} logged out successfully`);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * 验证邮箱
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const success = await this.userModel.verifyEmail(token);
      
      if (success) {
        return {
          success: true,
          message: 'Email verified successfully. You can now log in.'
        };
      } else {
        return {
          success: false,
          message: 'Invalid or expired verification token.'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Email verification failed.'
      };
    }
  }

  /**
   * 请求密码重置
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const token = await this.userModel.generatePasswordResetToken(email);
      
      if (token) {
        // 发送密码重置邮件（这里只是模拟）
        await this.sendPasswordResetEmail(email, token);
        
        return {
          success: true,
          message: 'Password reset email sent. Please check your inbox.'
        };
      } else {
        return {
          success: false,
          message: 'Email address not found.'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send password reset email.'
      };
    }
  }

  /**
   * 重置密码
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // 验证新密码
      this.validatePassword(newPassword);

      const success = await this.userModel.resetPassword(token, newPassword);
      
      if (success) {
        return {
          success: true,
          message: 'Password reset successfully. You can now log in with your new password.'
        };
      } else {
        return {
          success: false,
          message: 'Invalid or expired reset token.'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Password reset failed.'
      };
    }
  }

  /**
   * 验证访问令牌
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      const payload = this.verifyToken(token) as JWTPayload;
      
      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(userId: string): Promise<any> {
    try {
      // 先尝试从缓存获取
      try {
        const cachedUser = await cacheService.getUserSession(userId);
        if (cachedUser) {
          return cachedUser;
        }
      } catch (error) {
        // 缓存不可用，继续从数据库获取
      }

      // 从数据库获取完整用户信息
      const user = await this.userModel.getUserWithProfile(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 移除敏感信息
      const { password_hash, verification_token, reset_password_token, ...safeUser } = user;

      // 缓存用户信息
      await this.cacheUserSession(userId, safeUser);

      return safeUser;
    } catch (error) {
      throw new Error('Failed to get user information');
    }
  }

  /**
   * 生成JWT令牌
   */
  private generateToken(payload: Omit<JWTPayload, 'type'>, type: 'access' | 'refresh'): string {
    const tokenPayload: JWTPayload = { ...payload, type };
    const expiresIn = type === 'access' ? this.jwtExpiresIn : this.refreshTokenExpiresIn;
    
    return jwt.sign(tokenPayload, this.jwtSecret, { expiresIn } as jwt.SignOptions);
  }

  /**
   * 验证JWT令牌
   */
  private verifyToken(token: string): JWTPayload {
    return jwt.verify(token, this.jwtSecret) as JWTPayload;
  }

  /**
   * 生成访问令牌和刷新令牌
   */
  private async generateTokens(user: UserData): Promise<AuthTokens> {
    const payload = {
      userId: user.id!,
      email: user.email,
      username: user.username
    };

    const accessToken = this.generateToken(payload, 'access');
    const refreshToken = this.generateToken(payload, 'refresh');

    // 返回令牌和安全的用户信息
    const { password_hash, verification_token, reset_password_token, ...safeUser } = user;

    return {
      accessToken,
      refreshToken,
      user: safeUser
    };
  }

  /**
   * 缓存用户会话
   */
  private async cacheUserSession(userId: string, sessionData: any): Promise<void> {
    try {
      await cacheService.setUserSession(userId, sessionData, 86400); // 24小时
    } catch (error) {
      // 在开发环境中，如果缓存失败，只记录日志但不抛出错误
      console.log('⚠️  Cache unavailable, skipping session cache');
    }
  }

  /**
   * 验证注册数据
   */
  private validateRegisterData(data: RegisterData): void {
    const { email, username, password } = data;

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // 验证用户名
    if (username.length < 3 || username.length > 20) {
      throw new Error('Username must be between 3 and 20 characters');
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }

    // 验证密码
    this.validatePassword(password);
  }

  /**
   * 验证密码强度
   */
  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      throw new Error('Password must be less than 128 characters');
    }

    // 检查密码复杂性
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const complexityCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

    if (complexityCount < 3) {
      throw new Error('Password must contain at least 3 of the following: uppercase letters, lowercase letters, numbers, special characters');
    }
  }

  /**
   * 发送验证邮件（模拟）
   */
  private async sendVerificationEmail(email: string, token: string): Promise<void> {
    // 在实际应用中，这里应该集成真实的邮件服务
    console.log(`📧 Verification email sent to ${email}`);
    console.log(`🔗 Verification link: http://localhost:3000/verify-email?token=${token}`);
    
    // 模拟邮件发送延迟
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * 发送密码重置邮件（模拟）
   */
  private async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // 在实际应用中，这里应该集成真实的邮件服务
    console.log(`📧 Password reset email sent to ${email}`);
    console.log(`🔗 Reset link: http://localhost:3000/reset-password?token=${token}`);
    
    // 模拟邮件发送延迟
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// 导出单例实例
export const authService = new AuthService();