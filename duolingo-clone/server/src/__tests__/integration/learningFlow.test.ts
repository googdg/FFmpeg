import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Create test app
const app = express();
app.use(express.json());

// Import routes after setting up mocks
import learningRoutes from '../../routes/learning';
import authRoutes from '../../routes/auth';

app.use('/api/learning', learningRoutes);
app.use('/api/auth', authRoutes);

// Mock services
jest.mock('../../services/LearningService');
jest.mock('../../services/AuthService');
jest.mock('../../middleware/auth');

import { learningService } from '../../services/LearningService';
import { authService } from '../../services/AuthService';
import { auth } from '../../middleware/auth';

describe('Learning Flow Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let sessionId: string;

  beforeEach(() => {
    jest.clearAllMocks();
    
    userId = 'test-user-id';
    authToken = 'mock-jwt-token';
    sessionId = 'test-session-id';

    // Mock auth middleware
    (auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: userId, username: 'testuser' };
      next();
    });
  });

  describe('Complete Learning Session Flow', () => {
    test('user can complete full learning session', async () => {
      // Mock service responses
      const mockCourses = [
        {
          id: 'course-1',
          name: '英语基础',
          description: '学习基础英语',
        },
      ];

      const mockCourseStructure = {
        course: { id: 'course-1', name: '英语基础' },
        units: [
          {
            id: 'unit-1',
            name: '基础单元',
            skills: [
              {
                id: 'skill-1',
                name: '问候',
                lessons: [{ id: 'lesson-1', name: '基础问候' }],
              },
            ],
          },
        ],
      };

      const mockSession = {
        id: sessionId,
        userId,
        lessonId: 'lesson-1',
        exercises: [
          {
            id: 'exercise-1',
            type: 'multiple_choice',
            question: '如何用英语说"你好"？',
            correct_answer: 'Hello',
            options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
          },
        ],
        currentExerciseIndex: 0,
        startedAt: new Date(),
        isCompleted: false,
      };

      const mockExercise = mockSession.exercises[0];

      const mockAnswerResult = {
        isCorrect: true,
        correctAnswer: 'Hello',
        xpEarned: 10,
        heartsLost: 0,
        isSessionComplete: true,
      };

      const mockCompletionResult = {
        sessionId,
        xpEarned: 10,
        heartsLost: 0,
        accuracy: 100,
        timeSpent: 30000,
        exercisesCompleted: 1,
        isCompleted: true,
      };

      (learningService.getCourses as jest.Mock).mockResolvedValue(mockCourses);
      (learningService.getCourseStructure as jest.Mock).mockResolvedValue(mockCourseStructure);
      (learningService.startLearningSession as jest.Mock).mockResolvedValue(mockSession);
      (learningService.getCurrentExercise as jest.Mock).mockResolvedValue(mockExercise);
      (learningService.submitExerciseAnswer as jest.Mock).mockResolvedValue(mockAnswerResult);
      (learningService.completeLearningSession as jest.Mock).mockResolvedValue(mockCompletionResult);

      // Step 1: Get available courses
      const coursesResponse = await request(app)
        .get('/api/learning/courses')
        .expect(200);

      expect(coursesResponse.body.success).toBe(true);
      expect(coursesResponse.body.data.courses).toEqual(mockCourses);

      // Step 2: Get course structure
      const structureResponse = await request(app)
        .get('/api/learning/courses/course-1/structure')
        .expect(200);

      expect(structureResponse.body.success).toBe(true);
      expect(structureResponse.body.data.structure).toEqual(mockCourseStructure);

      // Step 3: Start learning session
      const sessionResponse = await request(app)
        .post('/api/learning/sessions/start')
        .send({ lessonId: 'lesson-1' })
        .expect(200);

      expect(sessionResponse.body.success).toBe(true);
      expect(sessionResponse.body.data.session.id).toBe(sessionId);

      // Step 4: Get current exercise
      const exerciseResponse = await request(app)
        .get(`/api/learning/sessions/${sessionId}/exercise`)
        .expect(200);

      expect(exerciseResponse.body.success).toBe(true);
      expect(exerciseResponse.body.data.exercise).toEqual(mockExercise);

      // Step 5: Submit answer
      const answerResponse = await request(app)
        .post(`/api/learning/sessions/${sessionId}/answer`)
        .send({
          exerciseId: 'exercise-1',
          userAnswer: 'Hello',
          timeSpent: 5000,
        })
        .expect(200);

      expect(answerResponse.body.success).toBe(true);
      expect(answerResponse.body.data.result.isCorrect).toBe(true);
      expect(answerResponse.body.data.result.isSessionComplete).toBe(true);

      // Step 6: Complete session
      const completionResponse = await request(app)
        .post('/api/learning/sessions/complete')
        .send({ sessionId })
        .expect(200);

      expect(completionResponse.body.success).toBe(true);
      expect(completionResponse.body.data.result.isCompleted).toBe(true);

      // Verify service calls
      expect(learningService.getCourses).toHaveBeenCalledTimes(1);
      expect(learningService.getCourseStructure).toHaveBeenCalledWith('course-1');
      expect(learningService.startLearningSession).toHaveBeenCalledWith(userId, 'lesson-1');
      expect(learningService.getCurrentExercise).toHaveBeenCalledWith(sessionId);
      expect(learningService.submitExerciseAnswer).toHaveBeenCalledWith(
        sessionId,
        'exercise-1',
        'Hello',
        5000
      );
      expect(learningService.completeLearningSession).toHaveBeenCalledWith(sessionId);
    });

    test('handles incorrect answers and session continuation', async () => {
      const mockSession = {
        id: sessionId,
        userId,
        lessonId: 'lesson-1',
        exercises: [
          {
            id: 'exercise-1',
            type: 'multiple_choice',
            question: '如何用英语说"你好"？',
            correct_answer: 'Hello',
            options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
          },
          {
            id: 'exercise-2',
            type: 'translation',
            question: '请翻译：Good morning',
            correct_answer: '早上好',
          },
        ],
        currentExerciseIndex: 0,
        startedAt: new Date(),
        isCompleted: false,
      };

      const mockIncorrectResult = {
        isCorrect: false,
        correctAnswer: 'Hello',
        xpEarned: 0,
        heartsLost: 1,
        isSessionComplete: false,
      };

      const mockCorrectResult = {
        isCorrect: true,
        correctAnswer: '早上好',
        xpEarned: 10,
        heartsLost: 0,
        isSessionComplete: true,
      };

      (learningService.startLearningSession as jest.Mock).mockResolvedValue(mockSession);
      (learningService.getCurrentExercise as jest.Mock)
        .mockResolvedValueOnce(mockSession.exercises[0])
        .mockResolvedValueOnce(mockSession.exercises[1]);
      (learningService.submitExerciseAnswer as jest.Mock)
        .mockResolvedValueOnce(mockIncorrectResult)
        .mockResolvedValueOnce(mockCorrectResult);

      // Start session
      await request(app)
        .post('/api/learning/sessions/start')
        .send({ lessonId: 'lesson-1' })
        .expect(200);

      // Submit incorrect answer
      const incorrectResponse = await request(app)
        .post(`/api/learning/sessions/${sessionId}/answer`)
        .send({
          exerciseId: 'exercise-1',
          userAnswer: 'Goodbye',
          timeSpent: 8000,
        })
        .expect(200);

      expect(incorrectResponse.body.data.result.isCorrect).toBe(false);
      expect(incorrectResponse.body.data.result.heartsLost).toBe(1);
      expect(incorrectResponse.body.data.result.isSessionComplete).toBe(false);

      // Get next exercise
      const nextExerciseResponse = await request(app)
        .get(`/api/learning/sessions/${sessionId}/exercise`)
        .expect(200);

      expect(nextExerciseResponse.body.data.exercise.id).toBe('exercise-2');

      // Submit correct answer
      const correctResponse = await request(app)
        .post(`/api/learning/sessions/${sessionId}/answer`)
        .send({
          exerciseId: 'exercise-2',
          userAnswer: '早上好',
          timeSpent: 6000,
        })
        .expect(200);

      expect(correctResponse.body.data.result.isCorrect).toBe(true);
      expect(correctResponse.body.data.result.isSessionComplete).toBe(true);
    });
  });

  describe('Offline Sync Integration', () => {
    test('syncs offline progress successfully', async () => {
      const offlineProgress = {
        sessionId: 'offline-session-123',
        lessonId: 'lesson-1',
        answers: [
          { exerciseId: 'ex1', isCorrect: true },
          { exerciseId: 'ex2', isCorrect: false },
          { exerciseId: 'ex3', isCorrect: true },
        ],
        completedAt: new Date(),
        isOffline: true,
      };

      const response = await request(app)
        .post('/api/learning/sessions/sync')
        .send(offlineProgress)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.xpEarned).toBe(20); // 2 correct * 10 XP
      expect(response.body.data.accuracy).toBe(66.67); // 2/3 * 100, rounded
      expect(response.body.data.correctAnswers).toBe(2);
      expect(response.body.data.totalAnswers).toBe(3);
      expect(response.body.message).toBe('Offline progress synced successfully');
    });

    test('handles multiple offline sessions sync', async () => {
      const offlineSessions = [
        {
          sessionId: 'offline-1',
          lessonId: 'lesson-1',
          answers: [{ exerciseId: 'ex1', isCorrect: true }],
          completedAt: new Date(),
          isOffline: true,
        },
        {
          sessionId: 'offline-2',
          lessonId: 'lesson-2',
          answers: [
            { exerciseId: 'ex2', isCorrect: true },
            { exerciseId: 'ex3', isCorrect: true },
          ],
          completedAt: new Date(),
          isOffline: true,
        },
      ];

      const responses = await Promise.all(
        offlineSessions.map(session =>
          request(app)
            .post('/api/learning/sessions/sync')
            .send(session)
            .expect(200)
        )
      );

      responses.forEach((response, index) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.sessionId).toBe(offlineSessions[index].sessionId);
      });

      // Verify total XP earned
      const totalXP = responses.reduce((sum, res) => sum + res.body.data.xpEarned, 0);
      expect(totalXP).toBe(30); // 3 correct answers * 10 XP each
    });
  });

  describe('Error Handling Integration', () => {
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
        .send({}) // Missing lessonId
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    test('handles non-existent resources', async () => {
      (learningService.getCourseStructure as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/learning/courses/non-existent/structure')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Course not found');
    });

    test('handles session not found errors', async () => {
      (learningService.getCurrentExercise as jest.Mock).mockRejectedValue(
        new Error('Session not found')
      );

      const response = await request(app)
        .get('/api/learning/sessions/invalid-session/exercise')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Authentication Integration', () => {
    test('requires authentication for protected routes', async () => {
      // Mock auth middleware to reject
      (auth as jest.Mock).mockImplementationOnce((req, res, next) => {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      });

      await request(app)
        .get('/api/learning/progress/course-1')
        .expect(401);

      await request(app)
        .post('/api/learning/sessions/start')
        .send({ lessonId: 'lesson-1' })
        .expect(401);
    });

    test('allows access with valid authentication', async () => {
      const mockProgress = {
        course_xp: 150,
        completion_percentage: 25,
        skills: {},
      };

      (learningService.getUserProgress as jest.Mock).mockResolvedValue(mockProgress);

      const response = await request(app)
        .get('/api/learning/progress/course-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.progress).toEqual(mockProgress);
    });
  });

  describe('Data Consistency Integration', () => {
    test('maintains data consistency across multiple operations', async () => {
      const mockSession = {
        id: sessionId,
        userId,
        lessonId: 'lesson-1',
        exercises: [
          { id: 'ex1', correct_answer: 'Hello' },
          { id: 'ex2', correct_answer: 'Goodbye' },
        ],
        currentExerciseIndex: 0,
        xpEarned: 0,
        exercisesCompleted: 0,
        exercisesCorrect: 0,
      };

      (learningService.startLearningSession as jest.Mock).mockResolvedValue(mockSession);
      (learningService.getCurrentExercise as jest.Mock)
        .mockResolvedValueOnce(mockSession.exercises[0])
        .mockResolvedValueOnce(mockSession.exercises[1]);

      // Track session state changes
      let sessionState = { ...mockSession };

      (learningService.submitExerciseAnswer as jest.Mock).mockImplementation(
        async (sessionId, exerciseId, answer) => {
          const exercise = sessionState.exercises.find(ex => ex.id === exerciseId);
          const isCorrect = exercise && exercise.correct_answer === answer;
          
          sessionState.exercisesCompleted++;
          if (isCorrect) {
            sessionState.exercisesCorrect++;
            sessionState.xpEarned += 10;
          }
          sessionState.currentExerciseIndex++;

          return {
            isCorrect,
            correctAnswer: exercise?.correct_answer,
            xpEarned: isCorrect ? 10 : 0,
            heartsLost: isCorrect ? 0 : 1,
            isSessionComplete: sessionState.currentExerciseIndex >= sessionState.exercises.length,
          };
        }
      );

      // Start session
      await request(app)
        .post('/api/learning/sessions/start')
        .send({ lessonId: 'lesson-1' })
        .expect(200);

      // Submit first answer (correct)
      const firstResponse = await request(app)
        .post(`/api/learning/sessions/${sessionId}/answer`)
        .send({
          exerciseId: 'ex1',
          userAnswer: 'Hello',
          timeSpent: 5000,
        })
        .expect(200);

      expect(firstResponse.body.data.result.isCorrect).toBe(true);
      expect(firstResponse.body.data.result.isSessionComplete).toBe(false);

      // Submit second answer (incorrect)
      const secondResponse = await request(app)
        .post(`/api/learning/sessions/${sessionId}/answer`)
        .send({
          exerciseId: 'ex2',
          userAnswer: 'Hello', // Wrong answer
          timeSpent: 7000,
        })
        .expect(200);

      expect(secondResponse.body.data.result.isCorrect).toBe(false);
      expect(secondResponse.body.data.result.isSessionComplete).toBe(true);

      // Verify final session state
      expect(sessionState.exercisesCompleted).toBe(2);
      expect(sessionState.exercisesCorrect).toBe(1);
      expect(sessionState.xpEarned).toBe(10);
    });
  });

  describe('Performance Integration', () => {
    test('handles concurrent requests efficiently', async () => {
      const mockCourses = Array.from({ length: 10 }, (_, i) => ({
        id: `course-${i}`,
        name: `Course ${i}`,
        description: `Description ${i}`,
      }));

      (learningService.getCourses as jest.Mock).mockResolvedValue(mockCourses);

      // Make 10 concurrent requests
      const requests = Array.from({ length: 10 }, () =>
        request(app).get('/api/learning/courses')
      );

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.courses).toHaveLength(10);
      });

      // Service should be called for each request (no caching in this test)
      expect(learningService.getCourses).toHaveBeenCalledTimes(10);
    });

    test('handles large payload efficiently', async () => {
      const largeOfflineData = {
        sessionId: 'large-session',
        lessonId: 'lesson-1',
        answers: Array.from({ length: 100 }, (_, i) => ({
          exerciseId: `ex-${i}`,
          isCorrect: i % 2 === 0, // 50% correct
        })),
        completedAt: new Date(),
        isOffline: true,
      };

      const start = Date.now();
      
      const response = await request(app)
        .post('/api/learning/sessions/sync')
        .send(largeOfflineData)
        .expect(200);

      const duration = Date.now() - start;

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAnswers).toBe(100);
      expect(response.body.data.correctAnswers).toBe(50);
      expect(response.body.data.accuracy).toBe(50);
      
      // Should complete within reasonable time (2 seconds)
      expect(duration).toBeLessThan(2000);
    });
  });
});