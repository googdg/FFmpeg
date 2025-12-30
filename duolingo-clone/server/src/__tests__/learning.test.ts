import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import learningRoutes from '../routes/learning';
import { auth } from '../middleware/auth';

// Mock the auth middleware
jest.mock('../middleware/auth', () => ({
  auth: jest.fn((req, res, next) => {
    req.user = { id: 'test-user-id', username: 'testuser' };
    next();
  }),
}));

// Mock the learning service
jest.mock('../services/LearningService', () => ({
  learningService: {
    getCourses: jest.fn(),
    getCourseStructure: jest.fn(),
    getUserProgress: jest.fn(),
    startLearningSession: jest.fn(),
    getCurrentExercise: jest.fn(),
    submitExerciseAnswer: jest.fn(),
    completeLearningSession: jest.fn(),
    getLessonExercises: jest.fn(),
    updateUserXP: jest.fn(),
    updateUserStreak: jest.fn(),
  },
}));

import { learningService } from '../services/LearningService';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/learning', learningRoutes);

describe('Learning API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/learning/courses', () => {
    test('returns list of courses', async () => {
      const mockCourses = [
        {
          id: 'course-1',
          name: '英语基础',
          description: '学习基础英语',
          language_from: 'zh-CN',
          language_to: 'en',
        },
        {
          id: 'course-2',
          name: '英语进阶',
          description: '提升英语水平',
          language_from: 'zh-CN',
          language_to: 'en',
        },
      ];

      (learningService.getCourses as jest.Mock).mockResolvedValue(mockCourses);

      const response = await request(app)
        .get('/api/learning/courses')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { courses: mockCourses },
      });

      expect(learningService.getCourses).toHaveBeenCalledTimes(1);
    });

    test('handles service error', async () => {
      (learningService.getCourses as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      const response = await request(app)
        .get('/api/learning/courses')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/learning/courses/:courseId/structure', () => {
    test('returns course structure', async () => {
      const mockStructure = {
        course: {
          id: 'course-1',
          name: '英语基础',
          description: '学习基础英语',
        },
        units: [
          {
            id: 'unit-1',
            name: '基础单元',
            skills: [
              {
                id: 'skill-1',
                name: '问候',
                lessons: [
                  { id: 'lesson-1', name: '基础问候' },
                ],
              },
            ],
          },
        ],
      };

      (learningService.getCourseStructure as jest.Mock).mockResolvedValue(
        mockStructure
      );

      const response = await request(app)
        .get('/api/learning/courses/course-1/structure')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { structure: mockStructure },
      });

      expect(learningService.getCourseStructure).toHaveBeenCalledWith('course-1');
    });

    test('returns 404 for non-existent course', async () => {
      (learningService.getCourseStructure as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/learning/courses/nonexistent/structure')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Course not found',
      });
    });
  });

  describe('GET /api/learning/progress/:courseId', () => {
    test('returns user progress for authenticated user', async () => {
      const mockProgress = {
        course_xp: 150,
        completion_percentage: 25.5,
        current_unit_id: 'unit-1',
        skills: {
          'skill-1': {
            level: 2,
            xp_earned: 50,
            lessons_completed: 3,
            is_unlocked: true,
            strength: 0.8,
          },
        },
      };

      (learningService.getUserProgress as jest.Mock).mockResolvedValue(
        mockProgress
      );

      const response = await request(app)
        .get('/api/learning/progress/course-1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { progress: mockProgress },
      });

      expect(learningService.getUserProgress).toHaveBeenCalledWith(
        'test-user-id',
        'course-1'
      );
    });

    test('requires authentication', async () => {
      // Mock auth middleware to reject
      (auth as jest.Mock).mockImplementationOnce((req, res, next) => {
        res.status(401).json({ success: false, message: 'Unauthorized' });
      });

      await request(app)
        .get('/api/learning/progress/course-1')
        .expect(401);
    });
  });

  describe('POST /api/learning/sessions/start', () => {
    test('starts learning session', async () => {
      const mockSession = {
        id: 'session-123',
        userId: 'test-user-id',
        lessonId: 'lesson-1',
        exercises: [],
        currentExerciseIndex: 0,
        startedAt: new Date(),
        xpEarned: 0,
        heartsLost: 0,
        exercisesCompleted: 0,
        exercisesCorrect: 0,
        timeSpent: 0,
        isCompleted: false,
      };

      (learningService.startLearningSession as jest.Mock).mockResolvedValue(
        mockSession
      );

      const response = await request(app)
        .post('/api/learning/sessions/start')
        .send({ lessonId: 'lesson-1' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { session: mockSession },
        message: 'Learning session started successfully',
      });

      expect(learningService.startLearningSession).toHaveBeenCalledWith(
        'test-user-id',
        'lesson-1'
      );
    });

    test('validates required fields', async () => {
      const response = await request(app)
        .post('/api/learning/sessions/start')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Lesson ID is required');
    });
  });

  describe('GET /api/learning/sessions/:sessionId/exercise', () => {
    test('returns current exercise', async () => {
      const mockExercise = {
        id: 'exercise-1',
        lesson_id: 'lesson-1',
        type: 'multiple_choice',
        question: '如何用英语说"你好"？',
        correct_answer: 'Hello',
        options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
        order_index: 1,
        difficulty_level: 1,
      };

      (learningService.getCurrentExercise as jest.Mock).mockResolvedValue(
        mockExercise
      );

      const response = await request(app)
        .get('/api/learning/sessions/session-123/exercise')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { exercise: mockExercise },
      });

      expect(learningService.getCurrentExercise).toHaveBeenCalledWith(
        'session-123'
      );
    });

    test('returns null when no more exercises', async () => {
      (learningService.getCurrentExercise as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/learning/sessions/session-123/exercise')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { exercise: null },
      });
    });
  });

  describe('POST /api/learning/sessions/:sessionId/answer', () => {
    test('submits exercise answer', async () => {
      const mockResult = {
        isCorrect: true,
        correctAnswer: 'Hello',
        explanation: 'Hello是最常用的英语问候语',
        xpEarned: 10,
        heartsLost: 0,
        isSessionComplete: false,
      };

      (learningService.submitExerciseAnswer as jest.Mock).mockResolvedValue(
        mockResult
      );

      const response = await request(app)
        .post('/api/learning/sessions/session-123/answer')
        .send({
          exerciseId: 'exercise-1',
          userAnswer: 'Hello',
          timeSpent: 5000,
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { result: mockResult },
        message: 'Answer submitted successfully',
      });

      expect(learningService.submitExerciseAnswer).toHaveBeenCalledWith(
        'session-123',
        'exercise-1',
        'Hello',
        5000
      );
    });

    test('validates required fields', async () => {
      const response = await request(app)
        .post('/api/learning/sessions/session-123/answer')
        .send({ exerciseId: 'exercise-1' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User answer is required');
    });
  });

  describe('POST /api/learning/sessions/sync', () => {
    test('syncs offline progress', async () => {
      const response = await request(app)
        .post('/api/learning/sessions/sync')
        .send({
          sessionId: 'offline-session-123',
          lessonId: 'lesson-1',
          answers: [
            { exerciseId: 'ex1', isCorrect: true },
            { exerciseId: 'ex2', isCorrect: false },
          ],
          completedAt: new Date(),
          isOffline: true,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.xpEarned).toBe(10); // 1 correct * 10 XP
      expect(response.body.data.accuracy).toBe(50); // 1/2 * 100
      expect(response.body.message).toBe('Offline progress synced successfully');
    });

    test('validates required fields for sync', async () => {
      const response = await request(app)
        .post('/api/learning/sessions/sync')
        .send({ sessionId: 'test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required fields');
    });
  });

  describe('GET /api/learning/lessons/:lessonId/exercises', () => {
    test('returns lesson exercises for offline download', async () => {
      const mockExercises = [
        {
          id: 'lesson-1_ex1',
          lesson_id: 'lesson-1',
          type: 'multiple_choice',
          question: '如何用英语说"你好"？',
          correct_answer: 'Hello',
          options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
          order_index: 1,
          difficulty_level: 1,
        },
        {
          id: 'lesson-1_ex2',
          lesson_id: 'lesson-1',
          type: 'translation',
          question: '请翻译：Good morning',
          correct_answer: '早上好',
          order_index: 2,
          difficulty_level: 1,
        },
      ];

      const response = await request(app)
        .get('/api/learning/lessons/lesson-1/exercises')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: { exercises: expect.any(Array) },
      });

      // Check that exercises have the expected structure
      const exercises = response.body.data.exercises;
      expect(exercises).toHaveLength(3); // Mock returns 3 exercises
      expect(exercises[0]).toHaveProperty('id');
      expect(exercises[0]).toHaveProperty('type');
      expect(exercises[0]).toHaveProperty('question');
      expect(exercises[0]).toHaveProperty('correct_answer');
    });
  });

  describe('Error Handling', () => {
    test('handles service errors gracefully', async () => {
      (learningService.getCourses as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/learning/courses')
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    test('handles validation errors', async () => {
      const response = await request(app)
        .post('/api/learning/sessions/start')
        .send({ invalidField: 'value' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    test('handles authentication errors', async () => {
      (auth as jest.Mock).mockImplementationOnce((req, res, next) => {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      });

      await request(app)
        .get('/api/learning/progress/course-1')
        .expect(401);
    });
  });

  describe('Response Format', () => {
    test('returns consistent response format for success', async () => {
      (learningService.getCourses as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/learning/courses')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(typeof response.body.data).toBe('object');
    });

    test('returns consistent response format for errors', async () => {
      (learningService.getCourses as jest.Mock).mockRejectedValue(
        new Error('Test error')
      );

      const response = await request(app)
        .get('/api/learning/courses')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});