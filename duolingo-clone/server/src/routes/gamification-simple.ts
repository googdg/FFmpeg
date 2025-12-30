import express from 'express';
import { auth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// 获取用户成就
router.get('/achievements', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const achievements = [
      {
        id: 'first_lesson',
        name: '初学者',
        description: '完成第一个练习',
        icon: '🎯',
        type: 'lessons',
        requirement: 1,
        xpReward: 50,
        gemsReward: 10,
        isEarned: true,
        earnedAt: new Date()
      },
      {
        id: 'streak_3',
        name: '坚持者',
        description: '连续学习3天',
        icon: '🔥',
        type: 'streak',
        requirement: 3,
        xpReward: 100,
        gemsReward: 20,
        isEarned: true,
        earnedAt: new Date()
      },
      {
        id: 'streak_7',
        name: '勤奋学习者',
        description: '连续学习7天',
        icon: '⭐',
        type: 'streak',
        requirement: 7,
        xpReward: 200,
        gemsReward: 50,
        isEarned: false
      }
    ];
    
    res.json({
      success: true,
      data: { achievements }
    });
  } catch (error) {
    next(error);
  }
});

// 获取排行榜
router.get('/leaderboard/:type', async (req, res, next) => {
  try {
    const { type } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const leaderboard = [
      { userId: 'user1', username: '英语达人', totalXP: 2850, currentStreak: 15, rank: 1 },
      { userId: 'user2', username: '学习之星', totalXP: 2640, currentStreak: 12, rank: 2 },
      { userId: 'user3', username: '词汇大师', totalXP: 2420, currentStreak: 18, rank: 3 },
      { userId: 'user4', username: '语法专家', totalXP: 2180, currentStreak: 8, rank: 4 },
      { userId: 'user5', username: '口语高手', totalXP: 1950, currentStreak: 22, rank: 5 }
    ].slice(0, limit);
    
    res.json({
      success: true,
      data: { leaderboard, type }
    });
  } catch (error) {
    next(error);
  }
});

// 获取用户排名
router.get('/leaderboard/:type/rank', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { type } = req.params;
    const rank = 15; // 模拟排名
    
    res.json({
      success: true,
      data: { rank, type }
    });
  } catch (error) {
    next(error);
  }
});

// 获取每日目标
router.get('/daily-goal', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const dailyGoal = {
      userId: req.user!.userId,
      date: new Date().toISOString().split('T')[0],
      targetXP: 50,
      currentXP: 30,
      isCompleted: false
    };
    
    res.json({
      success: true,
      data: { dailyGoal }
    });
  } catch (error) {
    next(error);
  }
});

// 获取用户游戏化统计
router.get('/stats', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const stats = {
      level: 2,
      totalXP: 150,
      xpToNextLevel: 50,
      currentStreak: 5,
      longestStreak: 8,
      hearts: 5,
      gems: 500,
      lessonsCompleted: 3,
      exercisesCompleted: 15,
      correctAnswers: 12,
      accuracy: 80,
      achievementsEarned: 2,
      totalAchievements: 10,
      dailyGoal: {
        targetXP: 50,
        currentXP: 30,
        isCompleted: false
      }
    };
    
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
});

export default router;