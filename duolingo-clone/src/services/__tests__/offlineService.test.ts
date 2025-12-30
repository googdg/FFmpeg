import { offlineService } from '../offlineService';

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
};

const mockIDBDatabase = {
  transaction: jest.fn(),
  createObjectStore: jest.fn(),
  close: jest.fn(),
};

const mockIDBTransaction = {
  objectStore: jest.fn(),
  oncomplete: null,
  onerror: null,
};

const mockIDBObjectStore = {
  put: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  createIndex: jest.fn(),
};

const mockIDBRequest = {
  result: null,
  error: null,
  onsuccess: null,
  onerror: null,
};

// Setup IndexedDB mocks
beforeAll(() => {
  Object.defineProperty(window, 'indexedDB', {
    value: mockIndexedDB,
    writable: true,
  });

  // Mock successful database opening
  mockIndexedDB.open.mockImplementation(() => {
    const request = { ...mockIDBRequest };
    setTimeout(() => {
      request.result = mockIDBDatabase;
      if (request.onsuccess) request.onsuccess({ target: request });
    }, 0);
    return request;
  });

  mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
  mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);
});

describe('OfflineService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock implementations
    mockIDBObjectStore.put.mockImplementation(() => {
      const request = { ...mockIDBRequest };
      setTimeout(() => {
        if (request.onsuccess) request.onsuccess({ target: request });
      }, 0);
      return request;
    });

    mockIDBObjectStore.get.mockImplementation(() => {
      const request = { ...mockIDBRequest };
      setTimeout(() => {
        request.result = null;
        if (request.onsuccess) request.onsuccess({ target: request });
      }, 0);
      return request;
    });

    mockIDBObjectStore.getAll.mockImplementation(() => {
      const request = { ...mockIDBRequest };
      setTimeout(() => {
        request.result = [];
        if (request.onsuccess) request.onsuccess({ target: request });
      }, 0);
      return request;
    });
  });

  describe('Initialization', () => {
    test('initializes database successfully', async () => {
      await expect(offlineService.init()).resolves.toBeUndefined();
      expect(mockIndexedDB.open).toHaveBeenCalledWith('duolingo-offline', 1);
    });

    test('handles database initialization error', async () => {
      mockIndexedDB.open.mockImplementationOnce(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.error = new Error('Database error');
          if (request.onerror) request.onerror({ target: request });
        }, 0);
        return request;
      });

      await expect(offlineService.init()).rejects.toThrow('Database error');
    });
  });

  describe('Content Management', () => {
    test('checks if content is downloaded', async () => {
      // Mock content exists
      mockIDBObjectStore.get.mockImplementationOnce(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = {
            id: 'course_test',
            type: 'course',
            data: { name: 'Test Course' },
          };
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const isDownloaded = await offlineService.isContentDownloaded('test');
      expect(isDownloaded).toBe(true);
    });

    test('returns false for non-existent content', async () => {
      const isDownloaded = await offlineService.isContentDownloaded('nonexistent');
      expect(isDownloaded).toBe(false);
    });

    test('gets offline course structure', async () => {
      const mockCourseData = {
        id: 'course_test',
        type: 'course',
        data: {
          id: 'test',
          name: 'Test Course',
          units: [],
        },
      };

      mockIDBObjectStore.get.mockImplementationOnce(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = mockCourseData;
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const course = await offlineService.getOfflineCourse('test');
      expect(course).toEqual(mockCourseData.data);
    });

    test('returns null for non-existent course', async () => {
      const course = await offlineService.getOfflineCourse('nonexistent');
      expect(course).toBeNull();
    });

    test('gets offline lesson content', async () => {
      const mockLessonData = {
        id: 'lesson_test',
        type: 'lesson',
        data: {
          lesson: { id: 'test', name: 'Test Lesson' },
          exercises: [],
        },
      };

      mockIDBObjectStore.get.mockImplementationOnce(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = mockLessonData;
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const lesson = await offlineService.getOfflineLesson('test');
      expect(lesson).toEqual(mockLessonData.data);
    });
  });

  describe('Progress Management', () => {
    test('saves offline progress', async () => {
      const mockProgress = {
        sessionId: 'session_test',
        lessonId: 'lesson_test',
        exercises: [],
        currentIndex: 0,
        answers: [],
        startedAt: new Date(),
        isCompleted: false,
      };

      await expect(
        offlineService.saveOfflineProgress(mockProgress)
      ).resolves.toBeUndefined();

      expect(mockIDBObjectStore.put).toHaveBeenCalledWith(mockProgress);
    });

    test('gets offline progress', async () => {
      const mockProgress = {
        sessionId: 'session_test',
        lessonId: 'lesson_test',
        exercises: [],
        currentIndex: 0,
        answers: [],
        startedAt: new Date(),
        isCompleted: true,
      };

      mockIDBObjectStore.get.mockImplementationOnce(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = mockProgress;
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const progress = await offlineService.getOfflineProgress('session_test');
      expect(progress).toEqual(mockProgress);
    });

    test('returns null for non-existent progress', async () => {
      const progress = await offlineService.getOfflineProgress('nonexistent');
      expect(progress).toBeNull();
    });

    test('gets pending progress for sync', async () => {
      const mockPendingProgress = [
        {
          sessionId: 'session_1',
          lessonId: 'lesson_1',
          exercises: [],
          currentIndex: 0,
          answers: [],
          startedAt: new Date(),
          isCompleted: true,
        },
        {
          sessionId: 'session_2',
          lessonId: 'lesson_2',
          exercises: [],
          currentIndex: 0,
          answers: [],
          startedAt: new Date(),
          isCompleted: true,
        },
      ];

      mockIDBObjectStore.getAll.mockImplementationOnce(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = mockPendingProgress;
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const pending = await offlineService.getPendingProgress();
      expect(pending).toEqual(mockPendingProgress);
    });

    test('deletes offline progress', async () => {
      await expect(
        offlineService.deleteOfflineProgress('session_test')
      ).resolves.toBeUndefined();

      expect(mockIDBObjectStore.delete).toHaveBeenCalledWith('session_test');
    });
  });

  describe('Storage Management', () => {
    test('gets storage usage statistics', async () => {
      const mockContents = [
        {
          id: 'content_1',
          type: 'course',
          data: {},
          size: 1024,
          downloadedAt: new Date(),
          lastUpdated: new Date(),
        },
        {
          id: 'content_2',
          type: 'lesson',
          data: {},
          size: 512,
          downloadedAt: new Date(),
          lastUpdated: new Date(),
        },
      ];

      const mockProgresses = [
        {
          sessionId: 'session_1',
          lessonId: 'lesson_1',
          exercises: [],
          currentIndex: 0,
          answers: [],
          startedAt: new Date(),
          isCompleted: true,
        },
      ];

      // Mock getAll calls for both stores
      mockIDBObjectStore.getAll
        .mockImplementationOnce(() => {
          const request = { ...mockIDBRequest };
          setTimeout(() => {
            request.result = mockContents;
            if (request.onsuccess) request.onsuccess({ target: request });
          }, 0);
          return request;
        })
        .mockImplementationOnce(() => {
          const request = { ...mockIDBRequest };
          setTimeout(() => {
            request.result = mockProgresses;
            if (request.onsuccess) request.onsuccess({ target: request });
          }, 0);
          return request;
        });

      const usage = await offlineService.getStorageUsage();
      
      expect(usage).toEqual({
        totalSize: 1536, // 1024 + 512
        contentCount: 2,
        progressCount: 1,
      });
    });

    test('gets downloaded courses list', async () => {
      const mockUserData = {
        'course_1': {
          downloadedAt: new Date(),
          totalSize: 1024,
          lessonCount: 5,
        },
        'course_2': {
          downloadedAt: new Date(),
          totalSize: 2048,
          lessonCount: 8,
        },
      };

      // Mock getUserData method
      mockIDBObjectStore.get.mockImplementationOnce(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = { key: 'downloaded_courses', value: mockUserData };
          if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
      });

      const courses = await offlineService.getDownloadedCourses();
      expect(courses).toEqual(['course_1', 'course_2']);
    });

    test('returns empty array when no courses downloaded', async () => {
      const courses = await offlineService.getDownloadedCourses();
      expect(courses).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    test('handles database transaction errors', async () => {
      mockIDBObjectStore.put.mockImplementationOnce(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.error = new Error('Transaction failed');
          if (request.onerror) request.onerror({ target: request });
        }, 0);
        return request;
      });

      const mockProgress = {
        sessionId: 'session_test',
        lessonId: 'lesson_test',
        exercises: [],
        currentIndex: 0,
        answers: [],
        startedAt: new Date(),
        isCompleted: false,
      };

      await expect(
        offlineService.saveOfflineProgress(mockProgress)
      ).rejects.toThrow('Transaction failed');
    });

    test('handles database not initialized error', async () => {
      // Create a new instance without initialization
      const uninitializedService = Object.create(
        Object.getPrototypeOf(offlineService)
      );
      uninitializedService.db = null;

      await expect(
        uninitializedService.saveOfflineProgress({})
      ).rejects.toThrow('Database not initialized');
    });
  });

  describe('Event Handling', () => {
    test('dispatches download progress events', () => {
      const mockEventListener = jest.fn();
      window.addEventListener('offline-download-progress', mockEventListener);

      // Simulate progress event
      const progressEvent = new CustomEvent('offline-download-progress', {
        detail: {
          courseId: 'test',
          progress: 50,
          downloadedCount: 5,
          totalCount: 10,
          currentLesson: 'Test Lesson',
        },
      });

      window.dispatchEvent(progressEvent);

      expect(mockEventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            courseId: 'test',
            progress: 50,
          }),
        })
      );

      window.removeEventListener('offline-download-progress', mockEventListener);
    });

    test('dispatches sync complete events', () => {
      const mockEventListener = jest.fn();
      window.addEventListener('offline-sync-complete', mockEventListener);

      // Simulate sync complete event
      const syncEvent = new CustomEvent('offline-sync-complete', {
        detail: { syncedCount: 3 },
      });

      window.dispatchEvent(syncEvent);

      expect(mockEventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { syncedCount: 3 },
        })
      );

      window.removeEventListener('offline-sync-complete', mockEventListener);
    });
  });
});