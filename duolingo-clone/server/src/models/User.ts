import { BaseModel } from './BaseModel';
import { IUser } from '../interfaces/IUser';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface UserData {
  id?: string;
  email: string;
  username: string;
  password?: string;
  password_hash?: string;
  native_language?: string;
  learning_language?: string;
  is_verified?: boolean;
  verification_token?: string;
  reset_password_token?: string;
  reset_password_expires?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserProfile {
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  timezone?: string;
  notification_settings?: any;
  privacy_settings?: any;
}

export interface UserStats {
  user_id: string;
  total_xp?: number;
  current_streak?: number;
  longest_streak?: number;
  hearts?: number;
  gems?: number;
  level?: number;
  lessons_completed?: number;
  exercises_completed?: number;
  correct_answers?: number;
  last_activity_date?: Date;
}

export class User extends BaseModel implements IUser {
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

    const newUserData = {
      email,
      username,
      password_hash,
      native_language,
      learning_language,
      is_verified: false,
      verification_token
    };

    return await this.transaction(async (client) => {
      // 创建用户
      const userResult = await client.query(
        `INSERT INTO users (email, username, password_hash, native_language, learning_language, is_verified, verification_token)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, username, native_language, learning_language, is_verified, created_at`,
        [email, username, password_hash, native_language, learning_language, false, verification_token]
      );

      const user = userResult.rows[0];

      // 创建用户资料
      await client.query(
        `INSERT INTO user_profiles (user_id, display_name, timezone)
         VALUES ($1, $2, $3)`,
        [user.id, username, 'Asia/Shanghai']
      );

      // 创建用户统计
      await client.query(
        `INSERT INTO user_stats (user_id, hearts, gems)
         VALUES ($1, $2, $3)`,
        [user.id, 5, 500]
      );

      return {
        ...user,
        verification_token
      };
    });
  }

  /**
   * 通过邮箱查找用户
   */
  async findByEmail(email: string): Promise<UserData | null> {
    return await this.findOne('users', { email });
  }

  /**
   * 通过用户名查找用户
   */
  async findByUsername(username: string): Promise<UserData | null> {
    return await this.findOne('users', { username });
  }

  /**
   * 通过ID查找用户
   */
  async findById(id: string): Promise<UserData | null> {
    return await this.findOne('users', { id });
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
    const user = await this.findOne('users', { verification_token });
    
    if (!user) {
      return false;
    }

    await this.update(
      'users',
      { 
        is_verified: true, 
        verification_token: null 
      },
      { id: user.id }
    );

    return true;
  }

  /**
   * 更新用户信息
   */
  async updateUser(id: string, updateData: Partial<UserData>): Promise<UserData | null> {
    // 移除不应该直接更新的字段
    const { password, ...safeUpdateData } = updateData;
    
    // 如果需要更新密码，先加密
    if (password) {
      (safeUpdateData as any).password_hash = await bcrypt.hash(password, 12);
    }

    return await this.update('users', safeUpdateData, { id });
  }

  /**
   * 获取用户完整信息（包括资料和统计）
   */
  async getUserWithProfile(id: string): Promise<any> {
    const result = await this.query(
      `SELECT 
        u.id, u.email, u.username, u.native_language, u.learning_language, 
        u.is_verified, u.created_at,
        p.display_name, p.avatar_url, p.bio, p.timezone,
        p.notification_settings, p.privacy_settings,
        s.total_xp, s.current_streak, s.longest_streak, s.hearts, s.gems,
        s.level, s.lessons_completed, s.exercises_completed, s.correct_answers,
        s.last_activity_date
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       LEFT JOIN user_stats s ON u.id = s.user_id
       WHERE u.id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * 更新用户资料
   */
  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    return await this.update('user_profiles', profileData, { user_id: userId });
  }

  /**
   * 更新用户统计
   */
  async updateStats(userId: string, statsData: Partial<UserStats>): Promise<UserStats | null> {
    return await this.update('user_stats', statsData, { user_id: userId });
  }

  /**
   * 增加用户经验值
   */
  async addXP(userId: string, xp: number): Promise<void> {
    await this.query(
      `UPDATE user_stats 
       SET total_xp = total_xp + $1,
           level = FLOOR((total_xp + $1) / 100) + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [xp, userId]
    );
  }

  /**
   * 更新连击天数
   */
  async updateStreak(userId: string): Promise<void> {
    await this.query(
      `UPDATE user_stats 
       SET current_streak = CASE 
         WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
         WHEN last_activity_date = CURRENT_DATE THEN current_streak
         ELSE 1
       END,
       longest_streak = GREATEST(longest_streak, 
         CASE 
           WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
           WHEN last_activity_date = CURRENT_DATE THEN current_streak
           ELSE 1
         END
       ),
       last_activity_date = CURRENT_DATE,
       updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId]
    );
  }

  /**
   * 扣除生命值
   */
  async loseHeart(userId: string): Promise<number> {
    const result = await this.query(
      `UPDATE user_stats 
       SET hearts = GREATEST(0, hearts - 1),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING hearts`,
      [userId]
    );

    return result.rows[0]?.hearts || 0;
  }

  /**
   * 恢复生命值
   */
  async restoreHearts(userId: string, amount: number = 1): Promise<number> {
    const result = await this.query(
      `UPDATE user_stats 
       SET hearts = LEAST(5, hearts + $1),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING hearts`,
      [amount, userId]
    );

    return result.rows[0]?.hearts || 0;
  }

  /**
   * 消费宝石
   */
  async spendGems(userId: string, amount: number): Promise<boolean> {
    const result = await this.query(
      `UPDATE user_stats 
       SET gems = gems - $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2 AND gems >= $1
       RETURNING gems`,
      [amount, userId]
    );

    return (result.rowCount || 0) > 0;
  }

  /**
   * 获得宝石
   */
  async earnGems(userId: string, amount: number): Promise<number> {
    const result = await this.query(
      `UPDATE user_stats 
       SET gems = gems + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING gems`,
      [amount, userId]
    );

    return result.rows[0]?.gems || 0;
  }

  /**
   * 删除用户（软删除）
   */
  async deleteUser(id: string): Promise<boolean> {
    // 在实际应用中，可能需要软删除而不是硬删除
    return await this.delete('users', { id });
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

    await this.update(
      'users',
      {
        reset_password_token: reset_token,
        reset_password_expires: expires
      },
      { id: user.id }
    );

    return reset_token;
  }

  /**
   * 重置密码
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.query(
      `SELECT id FROM users 
       WHERE reset_password_token = $1 
       AND reset_password_expires > NOW()`,
      [token]
    );

    if (user.rows.length === 0) {
      return false;
    }

    const password_hash = await bcrypt.hash(newPassword, 12);

    await this.update(
      'users',
      {
        password_hash,
        reset_password_token: null,
        reset_password_expires: null
      },
      { id: user.rows[0].id }
    );

    return true;
  }
}