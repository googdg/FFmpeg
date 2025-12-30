import express from 'express';
import Joi from 'joi';
import { auth, AuthenticatedRequest } from '../middleware/auth';
import { gameificationService } from '../services/GameificationService';

const router = express.Router();

// 验证模式
const dailyGoalSchema = Joi.object({
  targetXP: Joi.number().min(10).max(200).required()
});

// 获取用户成就
router.get('/achievements', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const achievements = await gameificationService.getAllAchievements(userId);
    
    res.json({
      success: true,
      data: { achievements }
    });
  } catch (error) {
    next(error);
  }
});

// 获取用户已获得的成就
router.get('/achievements/earned', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const achievements = await gameificationService.getUserAchievements(userId);
    
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
    
    if (!['weekly', 'monthly', 'allTime'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid leaderboard type. Must be weekly, monthly, or allTime'
      });
    }
    
    const leaderboard = await gameificationService.generateLeaderboard(
      type as 'weekly' | 'monthly' | 'allTime',
      limit
    );
    
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
    const userId = req.user!.userId;
    
    if (!['weekly', 'monthly', 'allTime'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid leaderboard type. Must be weekly, monthly, or allTime'
      });
    }
    
    const rank = await gameificationService.getUserRank(
      userId,
      type as 'weekly' | 'monthly' | 'allTime'
    );
    
    res.json({
      success: true,
      data: { rank, type }
    });
  } catch (error) {
    next(error);
  }
});

// 设置每日目标
router.post('/daily-goal', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    // 验证请求数据
    const { error, value } = dailyGoalSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const userId = req.user!.userId;
    const { targetXP } = value;
    
    const dailyGoal = await gameificationService.setDailyGoal(userId, targetXP);
    
    res.json({
      success: true,
      data: { dailyGoal },
      message: 'Daily goal set successfully'
    });
  } catch (error) {
    next(error);
  }
});

// 获取每日目标
router.get('/daily-goal', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const dailyGoal = await gameificationService.getDailyGoal(userId);
    
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
    const userId = req.user!.userId;
    
    // 获取用户基本信息
    const user = await gameificationService['userModel'].getUserWithProfile(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 获取成就统计
    const achievements = await gameificationService.getUserAchievements(userId);
    const allAchievements = await gameificationService.getAllAchievements(userId);
    
    // 获取每日目标
    const dailyGoal = await gameificationService.getDailyGoal(userId);
    
    // 计算等级信息
    const totalXP = user.total_xp || 0;
    const currentLevel = gameificationService.calculateLevel(totalXP);
    const xpToNextLevel = gameificationService.getXPToNextLevel(totalXP);
    
    const stats = {
      level: currentLevel,
      totalXP,
      xpToNextLevel,
      currentStreak: user.current_streak || 0,
      longestStreak: user.longest_streak || 0,
      hearts: user.hearts || 5,
      gems: user.gems || 500,
      lessonsCompleted: user.lessons_completed || 0,
      exercisesCompleted: user.exercises_completed || 0,
      correctAnswers: user.correct_answers || 0,
      accuracy: user.exercises_completed > 0 
        ? Math.round((user.correct_answers / user.exercises_completed) * 100)
        : 0,
      achievementsEarned: achievements.length,
      totalAchievements: allAchievements.length,
      dailyGoal
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