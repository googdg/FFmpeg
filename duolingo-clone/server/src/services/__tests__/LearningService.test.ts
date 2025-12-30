import { LearningService } from '../LearningService';
import { MockCourse } from '../../models/MockCourse';
import { MockUser } from '../../models/MockUser';

// Mock the cache service
jest.mock('../CacheService', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    deletePattern: jest.fn(),
  },
}));

import { cacheService } from '../CacheService';

describe('LearningService', () => {
  let learningService: LearningService;
  let mockCourseModel: jest.Mocked<MockCourse>;
  let mockUserModel: jest.Mocked<MockUser>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create service instance
    learningService = new LearningService();
    
    // Mock the models
    mockCourseModel = {
      getCourses: jest.fn(),
      getCourseStructure: jest.fn(),
      getUserProgress: jest.fn(),
      getExercisesByLesson: jest.fn(),
      createCourse: jest.fn(),
      getCourseById: jest.fn(),
      updateCourse: jest.fn(),
      deleteCourse: jest.fn(),
      createUnit: jest.fn(),
      getUnitsByCourse: jest.fn(),
      getUnitById: jest.fn(),
      updateUnit: jest.fn(),
      deleteUnit: jest.fn(),
      createSkill: jest.fn(),
      getSkillsByUnit: jest.fn(),
      getSkillById: jest.fn(),
      updateSkill: jest.fn(),
      deleteSkill: jest.fn(),
      createLesson: jest.fn(),
      getLessonsBySkill: jest.fn(),
      getLessonById: jest.fn(),
      updateLesson: jest.fn(),
      deleteLesson: jest.fn(),
      createExercise: jest.fn(),
      getExerciseById: jest.fn(),
      updateExercise: jest.fn(),
      deleteExercise: jest.fn(),
    } as any;

    mockUserModel = {
      addXP: jest.fn(),
      loseHeart: jest.fn(),
      updateStreak: jest.fn(),
      createUser: jest.fn(),
      getUserById: jest.fn(),
      getUserByEmail: jest.fn(),
      getUserByUsername: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      verifyPassword: jest.fn(),
      updatePassword: jest.fn(),
    } as any;

    // Replace the models in the service
    (learningService as any).courseModel = mockCourseModel;
    (learningService as any).userModel = mockUserModel;
  });

  describe('getCourses', () => {
    test('returns courses from cache if available', async () => {
      const mockCourses = [
        { id: '1', name: 'English Basics', description: 'Learn basic English' },
        { id: '2', name: 'English Advanced', description: 'Advanced English' },
      ];

      (cacheService.get as jest.Mock).mockResolvedValue(mockCourses);

      const result = await learningService.getCourses();

      expect(result).toEqual(mockCourses);
      expect(cacheService.get).toHaveBeenCalledWith('courses:all');
      expect(mockCourseModel.getCourses).not.toHaveBeenCalled();
    });

    test('fetches courses from database when cache is empty', async () => {
      const mockCourses = [
        { id: '1', name: 'English Basics', description: 'Learn basic English' },
      ];

      (cacheService.get as jest.Mock).mockResolvedValue(null);
      mockCourseModel.getCourses.mockResolvedValue(mockCourses);

      const result = await learningService.getCourses();

      expect(result).toEqual(mockCourses);
      expect(mockCourseModel.getCourses).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalledWith(
        'courses:all',
        mockCourses,
        1800
      );
    });

    test('handles database errors', async () => {
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      mockCourseModel.getCourses.mockRejectedValue(new Error('Database error'));

      await expect(learningService.getCourses()).rejects.toThrow(
        'Failed to get courses'
      );
    });
  });

  describe('getCourseStructure', () => {
    test('returns course structure from cache if available', async () => {
      const mockStructure = {
        course: { id: '1', name: 'English Basics' },
        units: [],
      };

      (cacheService.get as jest.Mock).mockResolvedValue(mockStructure);

      const result = await learningService.getCourseStructure('course-1');

      expect(result).toEqual(mockStructure);
      expect(cacheService.get).toHaveBeenCalledWith('course:structure:course-1');
      expect(mockCourseModel.getCourseStructure).not.toHaveBeenCalled();
    });

    test('fetches course structure from database when cache is empty', async () => {
      const mockStructure = {
        course: { id: '1', name: 'English Basics' },
        units: [
          {
            id: 'unit-1',
            name: 'Unit 1',
            skills: [
              {
                id: 'skill-1',
                name: 'Greetings',
                lessons: [{ id: 'lesson-1', name: 'Basic Greetings' }],
              },
            ],
          },
        ],
      };

      (cacheService.get as jest.Mock).mockResolvedValue(null);
      mockCourseModel.getCourseStructure.mockResolvedValue(mockStructure);

      const result = await learningService.getCourseStructure('course-1');

      expect(result).toEqual(mockStructure);
      expect(mockCourseModel.getCourseStructure).toHaveBeenCalledWith('course-1');
      expect(cacheService.set).toHaveBeenCalledWith(
        'course:structure:course-1',
        mockStructure,
        3600
      );
    });
  });

  describe('getUserProgress', () => {
    test('returns user progress from cache if available', async () => {
      const mockProgress = {
        course_xp: 150,
        completion_percentage: 25.5,
        current_unit_id: 'unit-1',
        skills: {},
      };

      (cacheService.get as jest.Mock).mockResolvedValue(mockProgress);

      const result = await learningService.getUserProgress('user-1', 'course-1');

      expect(result).toEqual(mockProgress);
      expect(cacheService.get).toHaveBeenCalledWith('progress:user-1:course-1');
      expect(mockCourseModel.getUserProgress).not.toHaveBeenCalled();
    });

    test('fetches user progress from database when cache is empty', async () => {
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

      (cacheService.get as jest.Mock).mockResolvedValue(null);
      mockCourseModel.getUserProgress.mockResolvedValue(mockProgress);

      const result = await learningService.getUserProgress('user-1', 'course-1');

      expect(result).toEqual(mockProgress);
      expect(mockCourseModel.getUserProgress).toHaveBeenCalledWith(
        'user-1',
        'course-1'
      );
      expect(cacheService.set).toHaveBeenCalledWith(
        'progress:user-1:course-1',
        mockProgress,
        300
      );
    });
  });

  describe('startLearningSession', () => {
    test('creates a new learning session successfully', async () => {
      const mockExercises = [
        {
          id: 'ex1',
          lesson_id: 'lesson-1',
          type: 'multiple_choice',
          question: 'Test question',
          correct_answer: 'Test answer',
          order_index: 1,
        },
        {
          id: 'ex2',
          lesson_id: 'lesson-1',
          type: 'translation',
          question: 'Translate this',
          correct_answer: 'Translation',
          order_index: 2,
        },
      ];

      mockCourseModel.getExercisesByLesson.mockResolvedValue(mockExercises);

      const result = await learningService.startLearningSession(
        'user-1',
        'lesson-1'
      );

      expect(result).toMatchObject({
        userId: 'user-1',
        lessonId: 'lesson-1',
        exercises: mockExercises,
        currentExerciseIndex: 0,
        xpEarned: 0,
        heartsLost: 0,
        exercisesCompleted: 0,
        exercisesCorrect: 0,
        timeSpent: 0,
        isCompleted: false,
      });

      expect(result.id).toMatch(/^session_/);
      expect(result.startedAt).toBeInstanceOf(Date);
    });

    test('throws error when no exercises found', async () => {
      mockCourseModel.getExercisesByLesson.mockResolvedValue([]);

      await expect(
        learningService.startLearningSession('user-1', 'lesson-1')
      ).rejects.toThrow('No exercises found for this lesson');
    });

    test('handles database errors', async () => {
      mockCourseModel.getExercisesByLesson.mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        learningService.startLearningSession('user-1', 'lesson-1')
      ).rejects.toThrow('Failed to start learning session');
    });
  });

  describe('getCurrentExercise', () => {
    test('returns current exercise from active session', async () => {
      const mockExercises = [
        {
          id: 'ex1',
          lesson_id: 'lesson-1',
          type: 'multiple_choice',
          question: 'Test question',
          correct_answer: 'Test answer',
          order_index: 1,
        },
      ];

      // Start a session first
      mockCourseModel.getExercisesByLesson.mockResolvedValue(mockExercises);
      const session = await learningService.startLearningSession(
        'user-1',
        'lesson-1'
      );

      const result = await learningService.getCurrentExercise(session.id);

      expect(result).toEqual(mockExercises[0]);
    });

    test('returns null when all exercises completed', async () => {
      const mockExercises = [
        {
          id: 'ex1',
          lesson_id: 'lesson-1',
          type: 'multiple_choice',
          question: 'Test question',
          correct_answer: 'Test answer',
          order_index: 1,
        },
      ];

      mockCourseModel.getExercisesByLesson.mockResolvedValue(mockExercises);
      const session = await learningService.startLearningSession(
        'user-1',
        'lesson-1'
      );

      // Manually set the session to completed state
      const activeSessions = (learningService as any).activeSessions;
      const sessionData = activeSessions.get(session.id);
      sessionData.currentExerciseIndex = 1; // Beyond the last exercise

      const result = await learningService.getCurrentExercise(session.id);

      expect(result).toBeNull();
    });

    test('throws error for non-existent session', async () => {
      await expect(
        learningService.getCurrentExercise('non-existent-session')
      ).rejects.toThrow('Failed to get current exercise');
    });
  });

  describe('submitExerciseAnswer', () => {
    test('handles correct answer submission', async () => {
      const mockExercises = [
        {
          id: 'ex1',
          lesson_id: 'lesson-1',
          type: 'multiple_choice',
          question: 'Test question',
          correct_answer: 'Hello',
          order_index: 1,
          difficulty_level: 1,
        },
      ];

      mockCourseModel.getExercisesByLesson.mockResolvedValue(mockExercises);
      const session = await learningService.startLearningSession(
        'user-1',
        'lesson-1'
      );

      const result = await learningService.submitExerciseAnswer(
        session.id,
        'ex1',
        'Hello',
        5000
      );

      expect(result).toMatchObject({
        isCorrect: true,
        correctAnswer: 'Hello',
        xpEarned: expect.any(Number),
        heartsLost: 0,
        isSessionComplete: true, // Only one exercise
      });

      expect(result.xpEarned).toBeGreaterThan(0);
    });

    test('handles incorrect answer submission', async () => {
      const mockExercises = [
        {
          id: 'ex1',
          lesson_id: 'lesson-1',
          type: 'multiple_choice',
          question: 'Test question',
          correct_answer: 'Hello',
          order_index: 1,
          difficulty_level: 1,
        },
      ];

      mockCourseModel.getExercisesByLesson.mockResolvedValue(mockExercises);
      mockUserModel.loseHeart.mockResolvedValue();

      const session = await learningService.startLearningSession(
        'user-1',
        'lesson-1'
      );

      const result = await learningService.submitExerciseAnswer(
        session.id,
        'ex1',
        'Goodbye',
        5000
      );

      expect(result).toMatchObject({
        isCorrect: false,
        correctAnswer: 'Hello',
        xpEarned: 0,
        heartsLost: 1,
        isSessionComplete: true,
      });

      expect(mockUserModel.loseHeart).toHaveBeenCalledWith('user-1');
    });

    test('calculates XP based on difficulty and time', async () => {
      const mockExercises = [
        {
          id: 'ex1',
          lesson_id: 'lesson-1',
          type: 'multiple_choice',
          question: 'Test question',
          correct_answer: 'Hello',
          order_index: 1,
          difficulty_level: 2, // Higher difficulty
        },
      ];

      mockCourseModel.getExercisesByLesson.mockResolvedValue(mockExercises);
      const session = await learningService.startLearningSession(
        'user-1',
        'lesson-1'
      );

      // Fast answer (should get bonus)
      const fastResult = await learningService.submitExerciseAnswer(
        session.id,
        'ex1',
        'Hello',
        5000 // 5 seconds
      );

      expect(fastResult.xpEarned).toBeGreaterThan(10); // Base XP with bonuses
    });

    test('throws error for non-existent session', async () => {
      await expect(
        learningService.submitExerciseAnswer(
          'non-existent-session',
          'ex1',
          'answer',
          1000
        )
      ).rejects.toThrow('Failed to submit exercise answer');
    });

    test('throws error for wrong exercise', async () => {
      const mockExercises = [
        {
          id: 'ex1',
          lesson_id: 'lesson-1',
          type: 'multiple_choice',
          question: 'Test question',
          correct_answer: 'Hello',
          order_index: 1,
        },
      ];

      mockCourseModel.getExercisesByLesson.mockResolvedValue(mockExercises);
      const session = await learningService.startLearningSession(
        'user-1',
        'lesson-1'
      );

      await expect(
        learningService.submitExerciseAnswer(
          session.id,
          'wrong-exercise-id',
          'answer',
          1000
        )
      ).rejects.toThrow('Failed to submit exercise answer');
    });
  });

  describe('completeLearningSession', () => {
    test('completes session and updates user stats', async () => {
      const mockExercises = [
        {
          id: 'ex1',
          lesson_id: 'lesson-1',
          type: 'multiple_choice',
          question: 'Test question',
          correct_answer: 'Hello',
          order_index: 1,
        },
      ];

      mockCourseModel.getExercisesByLesson.mockResolvedValue(mockExercises);
      mockUserModel.addXP.mockResolvedValue();
      mockUserModel.updateStreak.mockResolvedValue();

      const session = await learningService.startLearningSession(
        'user-1',
        'lesson-1'
      );

      // Submit correct answer to complete session
      await learningService.submitExerciseAnswer(
        session.id,
        'ex1',
        'Hello',
        5000
      );

      const result = await learningService.completeLearningSession(session.id);

      expect(result).toMatchObject({
        sessionId: session.id,
        xpEarned: expect.any(Number),
        heartsLost: 0,
        accuracy: 100,
        timeSpent: 5000,
        exercisesCompleted: 1,
        isCompleted: true,
      });

      expect(mockUserModel.addXP).toHaveBeenCalledWith(
        'user-1',
        expect.any(Number)
      );
      expect(mockUserModel.updateStreak).toHaveBeenCalledWith('user-1');
    });

    test('throws error for incomplete session', async () => {
      const mockExercises = [
        {
          id: 'ex1',
          lesson_id: 'lesson-1',
          type: 'multiple_choice',
          question: 'Test question',
          correct_answer: 'Hello',
          order_index: 1,
        },
      ];

      mockCourseModel.getExercisesByLesson.mockResolvedValue(mockExercises);
      const session = await learningService.startLearningSession(
        'user-1',
        'lesson-1'
      );

      // Don't complete the session
      await expect(
        learningService.completeLearningSession(session.id)
      ).rejects.toThrow('Session is not completed yet');
    });

    test('throws error for non-existent session', async () => {
      await expect(
        learningService.completeLearningSession('non-existent-session')
      ).rejects.toThrow('Failed to complete learning session');
    });
  });

  describe('Answer Checking Logic', () => {
    test('checks multiple choice answers correctly', () => {
      const exercise = {
        id: 'ex1',
        type: 'multiple_choice' as const,
        correct_answer: 'Hello',
        question: 'Test',
        order_index: 1,
      };

      const checkAnswer = (learningService as any).checkAnswer.bind(
        learningService
      );

      expect(checkAnswer(exercise, 'Hello')).toBe(true);
      expect(checkAnswer(exercise, 'hello')).toBe(true); // Case insensitive
      expect(checkAnswer(exercise, 'Goodbye')).toBe(false);
    });

    test('checks translation answers with fuzzy matching', () => {
      const exercise = {
        id: 'ex1',
        type: 'translation' as const,
        correct_answer: '早上好',
        question: 'Test',
        order_index: 1,
      };

      const checkAnswer = (learningService as any).checkAnswer.bind(
        learningService
      );

      expect(checkAnswer(exercise, '早上好')).toBe(true);
      expect(checkAnswer(exercise, '早上')).toBe(true); // Partial match
      expect(checkAnswer(exercise, '晚上好')).toBe(false);
    });

    test('checks fill blank answers correctly', () => {
      const exercise = {
        id: 'ex1',
        type: 'fill_blank' as const,
        correct_answer: 'are',
        question: 'Test',
        order_index: 1,
      };

      const checkAnswer = (learningService as any).checkAnswer.bind(
        learningService
      );

      expect(checkAnswer(exercise, 'are')).toBe(true);
      expect(checkAnswer(exercise, 'ARE')).toBe(true); // Case insensitive
      expect(checkAnswer(exercise, 'is')).toBe(false);
    });
  });

  describe('XP Calculation', () => {
    test('calculates base XP correctly', () => {
      const exercise = {
        id: 'ex1',
        difficulty_level: 1,
      };

      const calculateXP = (learningService as any).calculateXP.bind(
        learningService
      );

      const xp = calculateXP(exercise, 15000); // 15 seconds
      expect(xp).toBe(10); // Base XP for difficulty 1
    });

    test('applies difficulty multiplier', () => {
      const exercise = {
        id: 'ex1',
        difficulty_level: 3,
      };

      const calculateXP = (learningService as any).calculateXP.bind(
        learningService
      );

      const xp = calculateXP(exercise, 15000);
      expect(xp).toBe(30); // Base XP * difficulty
    });

    test('applies time bonus for fast answers', () => {
      const exercise = {
        id: 'ex1',
        difficulty_level: 1,
      };

      const calculateXP = (learningService as any).calculateXP.bind(
        learningService
      );

      const xp = calculateXP(exercise, 5000); // 5 seconds (fast)
      expect(xp).toBe(12); // Base XP * 1.2 bonus
    });

    test('applies time penalty for slow answers', () => {
      const exercise = {
        id: 'ex1',
        difficulty_level: 1,
      };

      const calculateXP = (learningService as any).calculateXP.bind(
        learningService
      );

      const xp = calculateXP(exercise, 70000); // 70 seconds (slow)
      expect(xp).toBe(8); // Base XP * 0.8 penalty
    });

    test('ensures minimum XP', () => {
      const exercise = {
        id: 'ex1',
        difficulty_level: 0, // Very low difficulty
      };

      const calculateXP = (learningService as any).calculateXP.bind(
        learningService
      );

      const xp = calculateXP(exercise, 100000); // Very slow
      expect(xp).toBe(5); // Minimum XP
    });
  });
});