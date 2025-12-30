import { IUser } from '../interfaces/IUser';
import { MockUser } from '../models/MockUser';
import { User } from '../models/User';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'streak' | 'xp' | 'lessons' | 'perfect_lesson' | 'daily_goal' | 'special';
  requirement: number;
  xpReward: number;
  gemsReward: number;
  isEarned?: boolean;
  earnedAt?: Date;
}

export interface DailyGoal {
  userId: string;
  date: string;
  targetXP: number;
  currentXP: number;
  isCompleted: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName?: string;
  avatar?: string;
  totalXP: number;
  currentStreak: number;
  rank: number;
}

// 模拟数据存储
const mockAchievements: Map<string, Achievement> = new Map();
const mockUserAchievements: Map<string, Set<string>> = new Map();
const mockDailyGoals: Map<string, DailyGoal> = new Map();

// 初始化成就数据
function initializeAchievements() {
  const achievements: Achievement[] = [
    {
      id: 'first_lesson',
      name: '初学者',
      description: '完成第一个练习',
      icon: '🎯',
      type: 'lessons',
      requirement: 1,
      xpReward: 50,
      gemsReward: 10
    },
    {
      id: 'streak_3',
      name: '坚持者',
      description: '连续学习3天',
      icon: '🔥',
      type: 'streak',
      requirement: 3,
      xpReward: 100,
      gemsReward: 20
    },
    {
      id: 'streak_7',
      name: '勤奋学习者',
      description: '连续学习7天',
      icon: '⭐',
      type: 'streak',
      requirement: 7,
      xpReward: 200,
      gemsReward: 50
    },
    {
      id: 'streak_30',
      name: '学习达人',
      description: '连续学习30天',
      icon: '👑',
      type: 'streak',
      requirement: 30,
      xpReward: 500,
      gemsReward: 100
    },
    {
      id: 'xp_100',
      name: '经验丰富',
      description: '获得100 XP',
      icon: '📈',
      type: 'xp',
      requirement: 100,
      xpReward: 0,
      gemsReward: 25
    },
    {
      id: 'xp_500',
      name: '知识追求者',
      description: '获得500 XP',
      icon: '🧠',
      type: 'xp',
      requirement: 500,
      xpReward: 0,
      gemsReward: 50
    },
    {
      id: 'xp_1000',
      name: '学习专家',
      description: '获得1000 XP',
      icon: '🎓',
      type: 'xp',
      requirement: 1000,
      xpReward: 0,
      gemsReward: 100
    },
    {
      id: 'lessons_10',
      name: '课程完成者',
      description: '完成10个课程',
      icon: '📚',
      type: 'lessons',
      requirement: 10,
      xpReward: 300,
      gemsReward: 75
    },
    {
      id: 'perfect_lesson',
      name: '完美主义者',
      description: '完成一个课程且全部答对',
      icon: '💯',
      type: 'perfect_lesson',
      requirement: 1,
      xpReward: 150,
      gemsReward: 30
    },
    {
      id: 'daily_goal_7',
      name: '目标达成者',
      description: '连续7天完成每日目标',
      icon: '🎯',
      type: 'daily_goal',
      requirement: 7,
      xpReward: 250,
      gemsReward: 60
    }
  ];

  achievements.forEach(achievement => {
    mockAchievements.set(achievement.id, achievement);
  });
}

// 初始化数据
initializeAchievements();

export class GameificationService {
  private userModel: IUser;

  constructor() {
    // 在开发环境中使用模拟用户，生产环境使用真实数据库
    const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';
    const dbRequired = process.env.DB_REQUIRED === 'true';
    
    this.userModel = isDevelopment && !dbRequired 
      ? new MockUser() 
      : new User();
  }

  /**
   * 计算XP奖励
   */
  calculateXPReward(exerciseType: string, isCorrect: boolean, difficulty: number = 1): number {
    if (!isCorrect) return 0;

    const baseXP = {
      multiple_choice: 5,
      translation: 10,
      listening: 8,
      speaking: 12,
      fill_blank: 7,
      word_order: 6
    };

    const xp = (baseXP[exerciseType as keyof typeof baseXP] || 5) * difficulty;
    return Math.max(xp, 1);
  }

  /**
   * 添加XP并检查等级提升
   */
  async addXP(userId: string, xp: number): Promise<{
    xpAdded: number;
    totalXP: number;
    levelUp: boolean;
    newLevel?: number;
    oldLevel?: number;
  }> {
    const user = await this.userModel.getUserWithProfile(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const oldXP = user.total_xp || 0;
    const oldLevel = user.level || 1;
    
    await this.userModel.addXP(userId, xp);
    
    const newXP = oldXP + xp;
    const newLevel = this.calculateLevel(newXP);
    const levelUp = newLevel > oldLevel;

    // 如果升级了，给予额外奖励
    if (levelUp) {
      const gemsReward = newLevel * 10;
      await this.userModel.earnGems(userId, gemsReward);
    }

    return {
      xpAdded: xp,
      totalXP: newXP,
      levelUp,
      newLevel: levelUp ? newLevel : undefined,
      oldLevel: levelUp ? oldLevel : undefined
    };
  }

  /**
   * 根据XP计算等级
   */
  calculateLevel(totalXP: number): number {
    // 每100 XP升一级
    return Math.floor(totalXP / 100) + 1;
  }

  /**
   * 获取下一级所需XP
   */
  getXPToNextLevel(totalXP: number): number {
    const currentLevel = this.calculateLevel(totalXP);
    const nextLevelXP = currentLevel * 100;
    return nextLevelXP - totalXP;
  }

  /**
   * 更新连击并检查成就
   */
  async updateStreak(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    newAchievements: Achievement[];
  }> {
    await this.userModel.updateStreak(userId);
    
    const user = await this.userModel.getUserWithProfile(userId);
    const currentStreak = user.current_streak || 0;
    const longestStreak = user.longest_streak || 0;

    // 检查连击相关成就
    const newAchievements = await this.checkStreakAchievements(userId, currentStreak);

    return {
      currentStreak,
      longestStreak,
      newAchievements
    };
  }

  /**
   * 检查连击成就
   */
  private async checkStreakAchievements(userId: string, streak: number): Promise<Achievement[]> {
    const streakAchievements = Array.from(mockAchievements.values())
      .filter(achievement => achievement.type === 'streak' && achievement.requirement <= streak);

    const newAchievements: Achievement[] = [];
    const userAchievements = mockUserAchievements.get(userId) || new Set();

    for (const achievement of streakAchievements) {
      if (!userAchievements.has(achievement.id)) {
        await this.awardAchievement(userId, achievement.id);
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  /**
   * 检查XP成就
   */
  async checkXPAchievements(userId: string, totalXP: number): Promise<Achievement[]> {
    const xpAchievements = Array.from(mockAchievements.values())
      .filter(achievement => achievement.type === 'xp' && achievement.requirement <= totalXP);

    const newAchievements: Achievement[] = [];
    const userAchievements = mockUserAchievements.get(userId) || new Set();

    for (const achievement of xpAchievements) {
      if (!userAchievements.has(achievement.id)) {
        await this.awardAchievement(userId, achievement.id);
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  /**
   * 检查课程完成成就
   */
  async checkLessonAchievements(userId: string, lessonsCompleted: number, isPerfect: boolean = false): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    const userAchievements = mockUserAchievements.get(userId) || new Set();

    // 检查课程数量成就
    const lessonAchievements = Array.from(mockAchievements.values())
      .filter(achievement => achievement.type === 'lessons' && achievement.requirement <= lessonsCompleted);

    for (const achievement of lessonAchievements) {
      if (!userAchievements.has(achievement.id)) {
        await this.awardAchievement(userId, achievement.id);
        newAchievements.push(achievement);
      }
    }

    // 检查完美课程成就
    if (isPerfect && !userAchievements.has('perfect_lesson')) {
      const perfectAchievement = mockAchievements.get('perfect_lesson');
      if (perfectAchievement) {
        await this.awardAchievement(userId, 'perfect_lesson');
        newAchievements.push(perfectAchievement);
      }
    }

    return newAchievements;
  }

  /**
   * 颁发成就
   */
  async awardAchievement(userId: string, achievementId: string): Promise<void> {
    const achievement = mockAchievements.get(achievementId);
    if (!achievement) return;

    // 记录用户获得的成就
    if (!mockUserAchievements.has(userId)) {
      mockUserAchievements.set(userId, new Set());
    }
    mockUserAchievements.get(userId)!.add(achievementId);

    // 给予奖励
    if (achievement.xpReward > 0) {
      await this.userModel.addXP(userId, achievement.xpReward);
    }
    if (achievement.gemsReward > 0) {
      await this.userModel.earnGems(userId, achievement.gemsReward);
    }

    console.log(`🏆 Achievement unlocked for user ${userId}: ${achievement.name}`);
  }

  /**
   * 获取用户成就
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    const userAchievementIds = mockUserAchievements.get(userId) || new Set();
    const achievements: Achievement[] = [];

    for (const achievementId of userAchievementIds) {
      const achievement = mockAchievements.get(achievementId);
      if (achievement) {
        achievements.push({
          ...achievement,
          isEarned: true,
          earnedAt: new Date() // 模拟数据
        });
      }
    }

    return achievements;
  }

  /**
   * 获取所有成就（包括未获得的）
   */
  async getAllAchievements(userId: string): Promise<Achievement[]> {
    const userAchievementIds = mockUserAchievements.get(userId) || new Set();
    const achievements: Achievement[] = [];

    for (const achievement of mockAchievements.values()) {
      achievements.push({
        ...achievement,
        isEarned: userAchievementIds.has(achievement.id),
        earnedAt: userAchievementIds.has(achievement.id) ? new Date() : undefined
      });
    }

    return achievements.sort((a, b) => {
      if (a.isEarned && !b.isEarned) return -1;
      if (!a.isEarned && b.isEarned) return 1;
      return 0;
    });
  }

  /**
   * 设置每日目标
   */
  async setDailyGoal(userId: string, targetXP: number): Promise<DailyGoal> {
    const today = new Date().toISOString().split('T')[0];
    const goalId = `${userId}-${today}`;
    
    const dailyGoal: DailyGoal = {
      userId,
      date: today,
      targetXP,
      currentXP: 0,
      isCompleted: false
    };

    mockDailyGoals.set(goalId, dailyGoal);
    return dailyGoal;
  }

  /**
   * 更新每日目标进度
   */
  async updateDailyGoalProgress(userId: string, xpEarned: number): Promise<DailyGoal | null> {
    const today = new Date().toISOString().split('T')[0];
    const goalId = `${userId}-${today}`;
    
    const dailyGoal = mockDailyGoals.get(goalId);
    if (!dailyGoal) return null;

    dailyGoal.currentXP += xpEarned;
    dailyGoal.isCompleted = dailyGoal.currentXP >= dailyGoal.targetXP;

    // 如果完成了每日目标，给予额外奖励
    if (dailyGoal.isCompleted && dailyGoal.currentXP - xpEarned < dailyGoal.targetXP) {
      await this.userModel.earnGems(userId, 20);
    }

    return dailyGoal;
  }

  /**
   * 获取每日目标
   */
  async getDailyGoal(userId: string): Promise<DailyGoal | null> {
    const today = new Date().toISOString().split('T')[0];
    const goalId = `${userId}-${today}`;
    
    return mockDailyGoals.get(goalId) || null;
  }

  /**
   * 生成排行榜
   */
  async generateLeaderboard(type: 'weekly' | 'monthly' | 'allTime', limit: number = 10): Promise<LeaderboardEntry[]> {
    // 模拟排行榜数据
    const mockUsers = [
      { userId: 'user1', username: '英语达人', totalXP: 2850, currentStreak: 15 },
      { userId: 'user2', username: '学习之星', totalXP: 2640, currentStreak: 12 },
      { userId: 'user3', username: '词汇大师', totalXP: 2420, currentStreak: 18 },
      { userId: 'user4', username: '语法专家', totalXP: 2180, currentStreak: 8 },
      { userId: 'user5', username: '口语高手', totalXP: 1950, currentStreak: 22 },
      { userId: 'user6', username: '听力王者', totalXP: 1820, currentStreak: 6 },
      { userId: 'user7', username: '阅读冠军', totalXP: 1650, currentStreak: 11 },
      { userId: 'user8', username: '写作能手', totalXP: 1480, currentStreak: 9 },
      { userId: 'user9', username: '翻译高手', totalXP: 1320, currentStreak: 14 },
      { userId: 'user10', username: '学习新星', totalXP: 1150, currentStreak: 5 },
    ];

    return mockUsers
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
        displayName: user.username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
      }));
  }

  /**
   * 获取用户在排行榜中的排名
   */
  async getUserRank(userId: string, type: 'weekly' | 'monthly' | 'allTime'): Promise<number> {
    // 模拟用户排名
    return Math.floor(Math.random() * 50) + 1;
  }
}

// 导出单例实例
export const gameificationService = new GameificationService();