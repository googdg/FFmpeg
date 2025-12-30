import express from 'express';
import { auth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// 获取所有可用课程
router.get('/courses', async (req, res, next) => {
  try {
    const courses = [
      {
        id: 'course-1',
        name: '英语基础课程',
        description: '从零开始学习英语基础知识',
        language_from: 'zh-CN',
        language_to: 'en',
        difficulty_level: 1,
        order_index: 1
      }
    ];
    
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
    
    const courseStructure = {
      id: courseId,
      name: '英语基础课程',
      units: [
        {
          id: 'unit-1',
          name: '基础词汇',
          skills: [
            {
              id: 'skill-1',
              name: '问候语',
              lessons: [
                {
                  id: 'lesson-1',
                  name: '基础问候',
                  type: 'lesson',
                  xp_reward: 10
                }
              ]
            }
          ]
        }
      ]
    };
    
    res.json({
      success: true,
      data: { course: courseStructure }
    });
  } catch (error) {
    next(error);
  }
});

// 开始学习会话
router.post('/lessons/start', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { lessonId } = req.body;
    
    const sessionData = {
      sessionId: `session-${Date.now()}`,
      lesson: {
        id: lessonId,
        name: '基础问候',
        type: 'lesson',
        xp_reward: 10
      },
      exercises: [
        {
          id: 'exercise-1',
          type: 'multiple_choice',
          question: '如何用英语说"你好"？',
          options: ['Hello', 'Goodbye', 'Thank you', 'Sorry']
        }
      ],
      currentExercise: {
        id: 'exercise-1',
        type: 'multiple_choice',
        question: '如何用英语说"你好"？',
        options: ['Hello', 'Goodbye', 'Thank you', 'Sorry']
      }
    };
    
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
router.post('/exercises/submit', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { sessionId, exerciseId, userAnswer, timeSpent } = req.body;
    
    const result = {
      exerciseId,
      userAnswer,
      correct: userAnswer === 'Hello',
      correctAnswer: 'Hello',
      explanation: userAnswer === 'Hello' ? '正确！' : '正确答案是：Hello',
      xpEarned: userAnswer === 'Hello' ? 10 : 0,
      heartsLost: userAnswer === 'Hello' ? 0 : 1,
      timeSpent: timeSpent || 0
    };
    
    res.json({
      success: true,
      data: result,
      message: result.correct ? 'Correct answer!' : 'Incorrect answer'
    });
  } catch (error) {
    next(error);
  }
});

// 获取用户学习统计
router.get('/stats', auth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const stats = {
      totalXP: 150,
      currentStreak: 5,
      longestStreak: 8,
      lessonsCompleted: 3,
      exercisesCompleted: 15,
      correctAnswers: 12,
      accuracy: 80,
      hearts: 5,
      gems: 500,
      level: 2
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