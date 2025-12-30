import express from 'express';
import Joi from 'joi';
import { auth, AuthenticatedRequest } from '../middleware/auth';
import { learningService } from '../services/LearningService';

const router = express.Router();

// 验证模式
const startLessonSchema = Joi.object({
  lessonId: Joi.string().required()
});

const submitAnswerSchema = Joi.object({
  sessionId: Joi.string().required(),
  exerciseId: Joi.string().required(),
  userAnswer: Joi.string().required(),
  timeSpent: Joi.number().min(0).default(0)
});

// 获取所有可用课程
router.get('/courses', async (req, res, next) => {
  try {
    const courses = await learningService.getAvailableCourses();
    
    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    next(error);
  }
});

// 获取课程结构
router.get('/courses/:courseId', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }
    
    const courseStructure = await learningService.getCourseStructure(courseId, userId);
    
    res.json({
      success: true,
      data: { course: courseStructure }
    });
  } catch (error) {
    next(error);
  }
});

// 获取推荐课程
router.get('/courses/:courseId/recommended', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;
    
    const recommendedLesson = await learningService.getRecommendedLesson(userId, courseId);
    
    res.json({
      success: true,
      data: { lesson: recommendedLesson }
    });
  } catch (error) {
    next(error);
  }
});

// 开始学习会话
router.post('/lessons/start', auth, async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    // 验证请求数据
    const { error, value } = startLessonSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    const userId = req.user!.userId;
    const { lessonId } = value;
    
    const sessionData = await learningService.startLearningSession(userId, lessonId);
    
    res.json({
      success: true,
      data: sessionData,
      message: 'Learning session started successfully'
    });
  } catch (error) {
    next(error);
  }
});

// 提交练习题答案
router.post('/exercises/submit', auth, async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    // 验证请求数据
    const { error, value } = submitAnswerSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    const { sessionId, exerciseId, userAnswer, timeSpent } = value;
    
    const result = await learningService.submitExerciseAnswer(
      sessionId, 
      exerciseId, 
      userAnswer, 
      timeSpent
    );
    
    res.json({
      success: true,
      data: result,
      message: result.correct ? 'Correct answer!' : 'Incorrect answer'
    });
  } catch (error) {
    next(error);
  }
});

// 获取学习会话状态
router.get('/sessions/:sessionId', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const sessionData = await learningService.getLearningSession(sessionId);
    
    res.json({
      success: true,
      data: sessionData
    });
  } catch (error) {
    next(error);
  }
});

// 完成学习会话
router.post('/sessions/:sessionId/complete', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const completionData = await learningService.completeLearningSession(sessionId);
    
    res.json({
      success: true,
      data: completionData,
      message: 'Learning session completed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// 获取用户学习统计
router.get('/stats', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    
    const stats = await learningService.getUserLearningStats(userId);
    
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
/
/ 同步离线进度到服务器
router.post('/sessions/sync', auth, async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    const { sessionId, lessonId, answers, completedAt, isOffline } = req.body;
    
    if (!sessionId || !lessonId || !answers) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: sessionId, lessonId, answers'
      });
      return;
    }

    // 处理离线同步的学习进度
    const userId = req.user!.id;
    
    // 计算学习结果
    let correctAnswers = 0;
    const totalAnswers = answers.length;
    
    answers.forEach((answer: any) => {
      if (answer.isCorrect) {
        correctAnswers++;
      }
    });
    
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    const xpEarned = Math.floor(correctAnswers * 10); // 每题10XP
    
    // 模拟更新用户统计（在实际应用中会调用数据库）
    console.log(`📊 用户 ${userId} 同步离线进度: XP +${xpEarned}, 准确率 ${accuracy.toFixed(1)}%`);
    
    res.json({
      success: true,
      data: {
        sessionId,
        xpEarned,
        accuracy,
        correctAnswers,
        totalAnswers,
        syncedAt: new Date()
      },
      message: 'Offline progress synced successfully'
    });
  } catch (error) {
    next(error);
  }
});

// 获取课程练习题（用于离线下载）
router.get('/lessons/:lessonId/exercises', async (req, res, next): Promise<void> => {
  try {
    const { lessonId } = req.params;
    
    // 模拟练习题数据
    const mockExercises = [
      {
        id: `${lessonId}_ex1`,
        lesson_id: lessonId,
        type: 'multiple_choice',
        question: '如何用英语说"你好"？',
        correct_answer: 'Hello',
        options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
        order_index: 1,
        difficulty_level: 1
      },
      {
        id: `${lessonId}_ex2`,
        lesson_id: lessonId,
        type: 'translation',
        question: '请翻译：Good morning',
        correct_answer: '早上好',
        order_index: 2,
        difficulty_level: 1
      },
      {
        id: `${lessonId}_ex3`,
        lesson_id: lessonId,
        type: 'fill_blank',
        question: '填空：How ___ you?',
        correct_answer: 'are',
        order_index: 3,
        difficulty_level: 1
      }
    ];
    
    res.json({
      success: true,
      data: { exercises: mockExercises }
    });
  } catch (error) {
    next(error);
  }
});

export default router;