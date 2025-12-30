import { redisClient } from '../config/database';

export class CacheService {
  private static instance: CacheService;
  private defaultTTL = 3600; // 1小时默认过期时间

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * 设置缓存
   */
  async set(
    key: string,
    value: any,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.setEx(key, ttl, serializedValue);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Cache SET: ${key} (TTL: ${ttl}s)`);
      }
    } catch (error) {
      console.error('❌ Cache SET error:', error);
      throw error;
    }
  }

  /**
   * 获取缓存
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      
      if (value === null) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔍 Cache MISS: ${key}`);
        }
        return null;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Cache HIT: ${key}`);
      }
      
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('❌ Cache GET error:', error);
      return null;
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
    try {
      const result = await redisClient.del(key);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🗑️ Cache DELETE: ${key}`);
      }
      
      return result > 0;
    } catch (error) {
      console.error('❌ Cache DELETE error:', error);
      return false;
    }
  }

  /**
   * 批量删除缓存（通过模式匹配）
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await redisClient.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }

      const result = await redisClient.del(keys);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🗑️ Cache DELETE PATTERN: ${pattern} (${result} keys)`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Cache DELETE PATTERN error:', error);
      return 0;
    }
  }

  /**
   * 检查缓存是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('❌ Cache EXISTS error:', error);
      return false;
    }
  }

  /**
   * 设置缓存过期时间
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await redisClient.expire(key, ttl);
      return result === true;
    } catch (error) {
      console.error('❌ Cache EXPIRE error:', error);
      return false;
    }
  }

  /**
   * 获取缓存剩余过期时间
   */
  async ttl(key: string): Promise<number> {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      console.error('❌ Cache TTL error:', error);
      return -1;
    }
  }

  /**
   * 原子性递增
   */
  async increment(key: string, value: number = 1): Promise<number> {
    try {
      return await redisClient.incrBy(key, value);
    } catch (error) {
      console.error('❌ Cache INCREMENT error:', error);
      throw error;
    }
  }

  /**
   * 原子性递减
   */
  async decrement(key: string, value: number = 1): Promise<number> {
    try {
      return await redisClient.decrBy(key, value);
    } catch (error) {
      console.error('❌ Cache DECREMENT error:', error);
      throw error;
    }
  }

  /**
   * 获取或设置缓存（如果不存在则执行回调函数获取数据）
   */
  async getOrSet<T>(
    key: string,
    callback: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    try {
      // 先尝试从缓存获取
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // 缓存不存在，执行回调获取数据
      const data = await callback();
      
      // 将数据存入缓存
      await this.set(key, data, ttl);
      
      return data;
    } catch (error) {
      console.error('❌ Cache GET_OR_SET error:', error);
      throw error;
    }
  }

  /**
   * 用户会话缓存
   */
  async setUserSession(
    userId: string,
    sessionData: any,
    ttl: number = 86400 // 24小时
  ): Promise<void> {
    const key = `session:${userId}`;
    await this.set(key, sessionData, ttl);
  }

  async getUserSession(userId: string): Promise<any | null> {
    const key = `session:${userId}`;
    return await this.get(key);
  }

  async deleteUserSession(userId: string): Promise<boolean> {
    const key = `session:${userId}`;
    return await this.delete(key);
  }

  /**
   * 用户进度缓存
   */
  async setUserProgress(
    userId: string,
    courseId: string,
    progressData: any,
    ttl: number = 1800 // 30分钟
  ): Promise<void> {
    const key = `progress:${userId}:${courseId}`;
    await this.set(key, progressData, ttl);
  }

  async getUserProgress(
    userId: string,
    courseId: string
  ): Promise<any | null> {
    const key = `progress:${userId}:${courseId}`;
    return await this.get(key);
  }

  /**
   * 排行榜缓存
   */
  async setLeaderboard(
    type: 'weekly' | 'monthly' | 'allTime',
    data: any[],
    ttl: number = 300 // 5分钟
  ): Promise<void> {
    const key = `leaderboard:${type}`;
    await this.set(key, data, ttl);
  }

  async getLeaderboard(
    type: 'weekly' | 'monthly' | 'allTime'
  ): Promise<any[] | null> {
    const key = `leaderboard:${type}`;
    return await this.get(key);
  }

  /**
   * 课程内容缓存
   */
  async setCourseContent(
    courseId: string,
    content: any,
    ttl: number = 3600 // 1小时
  ): Promise<void> {
    const key = `course:${courseId}`;
    await this.set(key, content, ttl);
  }

  async getCourseContent(courseId: string): Promise<any | null> {
    const key = `course:${courseId}`;
    return await this.get(key);
  }

  /**
   * 清除用户相关的所有缓存
   */
  async clearUserCache(userId: string): Promise<void> {
    await Promise.all([
      this.deletePattern(`session:${userId}*`),
      this.deletePattern(`progress:${userId}*`),
    ]);
  }
}

// 导出单例实例
export const cacheService = CacheService.getInstance();