import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'duolingo_test';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.REDIS_URL = 'redis://localhost:6379';

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
  console.log = originalLog;
});

// Mock database connection
jest.mock('./config/database', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  },
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

// Mock Redis connection
jest.mock('./services/CacheService', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    deletePattern: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
  },
}));

// Global test utilities
export const mockUserData = {
  id: 'test-user-id',
  username: 'testuser',
  email: 'test@example.com',
  password_hash: '$2b$10$test.hash.value',
  created_at: new Date(),
  updated_at: new Date(),
  is_active: true,
  email_verified: true,
};

export const mockCourseData = {
  id: 'test-course-id',
  name: 'Test Course',
  description: 'A test course for learning',
  language_from: 'zh-CN',
  language_to: 'en',
  difficulty_level: 1,
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockExerciseData = {
  id: 'test-exercise-id',
  lesson_id: 'test-lesson-id',
  type: 'multiple_choice',
  question: 'Test question?',
  correct_answer: 'Test answer',
  options: ['Test answer', 'Wrong 1', 'Wrong 2', 'Wrong 3'],
  difficulty_level: 1,
  order_index: 1,
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockLearningSession = {
  id: 'test-session-id',
  userId: 'test-user-id',
  lessonId: 'test-lesson-id',
  exercises: [mockExerciseData],
  currentExerciseIndex: 0,
  startedAt: new Date(),
  xpEarned: 0,
  heartsLost: 0,
  exercisesCompleted: 0,
  exercisesCorrect: 0,
  timeSpent: 0,
  isCompleted: false,
};

// Helper function to create mock request object
export const createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: mockUserData,
  ...overrides,
});

// Helper function to create mock response object
export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

// Helper function to create mock next function
export const createMockNext = () => jest.fn();

// Helper function to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Database query result helpers
export const createMockQueryResult = (rows = [], rowCount = 0) => ({
  rows,
  rowCount,
  command: 'SELECT',
  oid: 0,
  fields: [],
});

// JWT token helpers
export const createMockJWTPayload = (overrides = {}) => ({
  id: 'test-user-id',
  username: 'testuser',
  email: 'test@example.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  ...overrides,
});

// Validation error helpers
export const createValidationError = (message: string, field?: string) => {
  const error = new Error(message);
  error.name = 'ValidationError';
  if (field) {
    (error as any).field = field;
  }
  return error;
};

// Database error helpers
export const createDatabaseError = (message: string, code?: string) => {
  const error = new Error(message);
  error.name = 'DatabaseError';
  if (code) {
    (error as any).code = code;
  }
  return error;
};

// Authentication error helpers
export const createAuthError = (message: string) => {
  const error = new Error(message);
  error.name = 'AuthenticationError';
  return error;
};

// Test data cleanup helper
export const cleanupTestData = async () => {
  // This would typically clean up test database records
  // For now, just reset mocks
  jest.clearAllMocks();
};

// Setup and teardown hooks
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(async () => {
  await cleanupTestData();
});