import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UserData, UserProfile, UserStats } from './User';
import { IUser } from '../interfaces/IUser';

// 模拟数据存储
const mockUsers: Map<string, UserData> = new Map();
const mockProfiles: Map<string, UserProfile> = new Map();
const mockStats: Map<string, UserStats> = new Map();

export class MockUser implements IUser {
  /**
   * 创建新用户
   */
  async create(userData: UserData): Promise<UserData> {
    const {
      email,
      username,
      password,
      native_language = 'zh-CN',
      learning_language = 'en'
    } = userData;

    // 检查邮箱是否已存在
    const existingEmailUser = await this.findByEmail(email);
    if (existingEmailUser) {
      throw new Error('Email already exists');
    }

    // 检查用户名是否已存在
    const existingUsernameUser = await this.findByUsername(username);
    if (existingUsernameUser) {
      throw new Error('Username already exists');
    }

    // 加密密码
    const password_hash = await bcrypt.hash(password!, 12);
    
    // 生成验证令牌
    const verification_token = uuidv4();
    const userId = uuidv4();

    const newUser: UserData = {
      id: userId,
      email,
      username,
      password_hash,
      native_language,
      learning_language,
      is_verified: false,
      verification_token,
      created_at: new Date(),
      updated_at: new Date()
    };

    // 存储用户
    mockUsers.set(userId, newUser);

    // 创建用户资料
    const profile: UserProfile = {
      user_id: userId,
      display_name: username,
      timezone: 'Asia/Shanghai',
      notification_settings: { email: true, push: true, daily_reminder: true },
      privacy_settings: { profile_public: true, show_streak: true }
    };
    mockProfiles.set(userId, profile);

    // 创建用户统计
    const stats: UserStats = {
      user_id: userId,
      total_xp: 0,
      current_streak: 0,
      longest_streak: 0,
      hearts: 5,
      gems: 500,
      level: 1,
      lessons_completed: 0,
      exercises_completed: 0,
      correct_answers: 0,
      last_activity_date: new Date()
    };
    mockStats.set(userId, stats);

    return {
      ...newUser,
      verification_token
    };
  }

  /**
   * 通过邮箱查找用户
   */
  async findByEmail(email: string): Promise<UserData | null> {
    for (const user of mockUsers.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  /**
   * 通过用户名查找用户
   */
  async findByUsername(username: string): Promise<UserData | null> {
    for (const user of mockUsers.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  /**
   * 通过ID查找用户
   */
  async findById(id: string): Promise<UserData | null> {
    return mockUsers.get(id) || null;
  }

  /**
   * 验证用户密码
   */
  async validatePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * 验证用户邮箱
   */
  async verifyEmail(verification_token: string): Promise<boolean> {
    for (const user of mockUsers.values()) {
      if (user.verification_token === verification_token) {
        user.is_verified = true;
        delete user.verification_token;
        user.updated_at = new Date();
        return true;
      }
    }
    return false;
  }

  /**
   * 更新用户信息
   */
  async updateUser(id: string, updateData: Partial<UserData>): Promise<UserData | null> {
    const user = mockUsers.get(id);
    if (!user) {
      return null;
    }

    // 移除不应该直接更新的字段
    const { password, ...safeUpdateData } = updateData;
    
    // 如果需要更新密码，先加密
    if (password) {
      (safeUpdateData as any).password_hash = await bcrypt.hash(password, 12);
    }

    Object.assign(user, safeUpdateData, { updated_at: new Date() });
    return user;
  }

  /**
   * 获取用户完整信息（包括资料和统计）
   */
  async getUserWithProfile(id: string): Promise<any> {
    const user = mockUsers.get(id);
    const profile = mockProfiles.get(id);
    const stats = mockStats.get(id);

    if (!user) {
      return null;
    }

    return {
      ...user,
      ...profile,
      ...stats
    };
  }

  /**
   * 更新用户资料
   */
  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    const profile = mockProfiles.get(userId);
    if (!profile) {
      return null;
    }

    Object.assign(profile, profileData);
    return profile;
  }

  /**
   * 更新用户统计
   */
  async updateStats(userId: string, statsData: Partial<UserStats>): Promise<UserStats | null> {
    const stats = mockStats.get(userId);
    if (!stats) {
      return null;
    }

    Object.assign(stats, statsData);
    return stats;
  }

  /**
   * 增加用户经验值
   */
  async addXP(userId: string, xp: number): Promise<void> {
    const stats = mockStats.get(userId);
    if (stats) {
      stats.total_xp = (stats.total_xp || 0) + xp;
      stats.level = Math.floor((stats.total_xp || 0) / 100) + 1;
    }
  }

  /**
   * 更新连击天数
   */
  async updateStreak(userId: string): Promise<void> {
    const stats = mockStats.get(userId);
    if (stats) {
      const today = new Date();
      const lastActivity = stats.last_activity_date;
      
      if (lastActivity) {
        const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // 连续学习
          stats.current_streak = (stats.current_streak || 0) + 1;
        } else if (daysDiff === 0) {
          // 同一天，保持连击
        } else {
          // 中断连击
          stats.current_streak = 1;
        }
      } else {
        stats.current_streak = 1;
      }
      
      stats.longest_streak = Math.max(stats.longest_streak || 0, stats.current_streak || 0);
      stats.last_activity_date = today;
    }
  }

  /**
   * 扣除生命值
   */
  async loseHeart(userId: string): Promise<number> {
    const stats = mockStats.get(userId);
    if (stats) {
      stats.hearts = Math.max(0, (stats.hearts || 5) - 1);
      return stats.hearts;
    }
    return 0;
  }

  /**
   * 恢复生命值
   */
  async restoreHearts(userId: string, amount: number = 1): Promise<number> {
    const stats = mockStats.get(userId);
    if (stats) {
      stats.hearts = Math.min(5, (stats.hearts || 0) + amount);
      return stats.hearts;
    }
    return 0;
  }

  /**
   * 消费宝石
   */
  async spendGems(userId: string, amount: number): Promise<boolean> {
    const stats = mockStats.get(userId);
    if (stats && (stats.gems || 0) >= amount) {
      stats.gems = (stats.gems || 0) - amount;
      return true;
    }
    return false;
  }

  /**
   * 获得宝石
   */
  async earnGems(userId: string, amount: number): Promise<number> {
    const stats = mockStats.get(userId);
    if (stats) {
      stats.gems = (stats.gems || 0) + amount;
      return stats.gems;
    }
    return 0;
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<boolean> {
    const deleted = mockUsers.delete(id);
    mockProfiles.delete(id);
    mockStats.delete(id);
    return deleted;
  }

  /**
   * 生成密码重置令牌
   */
  async generatePasswordResetToken(email: string): Promise<string | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const reset_token = uuidv4();
    const expires = new Date(Date.now() + 3600000); // 1小时后过期

    user.reset_password_token = reset_token;
    user.reset_password_expires = expires;
    user.updated_at = new Date();

    return reset_token;
  }

  /**
   * 重置密码
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    for (const user of mockUsers.values()) {
      if (user.reset_password_token === token && 
          user.reset_password_expires && 
          user.reset_password_expires > new Date()) {
        
        user.password_hash = await bcrypt.hash(newPassword, 12);
        delete user.reset_password_token;
        delete user.reset_password_expires;
        user.updated_at = new Date();
        
        return true;
      }
    }
    return false;
  }
}