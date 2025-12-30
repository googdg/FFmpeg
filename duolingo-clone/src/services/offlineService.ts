import { api } from './api';

export interface OfflineContent {
  id: string;
  type: 'course' | 'lesson' | 'exercise';
  data: any;
  downloadedAt: Date;
  lastUpdated: Date;
  size: number;
}

export interface OfflineProgress {
  sessionId: string;
  lessonId: string;
  exercises: any[];
  currentIndex: number;
  answers: any[];
  startedAt: Date;
  isCompleted: boolean;
}

class OfflineService {
  private dbName = 'duolingo-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建内容存储
        if (!db.objectStoreNames.contains('content')) {
          const contentStore = db.createObjectStore('content', { keyPath: 'id' });
          contentStore.createIndex('type', 'type', { unique: false });
          contentStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
        }

        // 创建离线进度存储
        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'sessionId' });
          progressStore.createIndex('lessonId', 'lessonId', { unique: false });
          progressStore.createIndex('startedAt', 'startedAt', { unique: false });
        }

        // 创建用户数据存储
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * 下载课程内容到本地
   */
  async downloadCourse(courseId: string): Promise<void> {
    try {
      console.log(`📥 开始下载课程: ${courseId}`);
      
      // 获取课程结构
      const courseStructure = await api.get(`/learning/courses/${courseId}/structure`);
      
      // 保存课程结构
      await this.saveContent({
        id: `course_${courseId}`,
        type: 'course',
        data: courseStructure.data.structure,
        downloadedAt: new Date(),
        lastUpdated: new Date(),
        size: JSON.stringify(courseStructure.data.structure).length
      });

      // 下载所有课程内容
      const structure = courseStructure.data.structure;
      let totalSize = 0;
      let downloadedCount = 0;
      let totalCount = 0;

      // 计算总数
      structure.units?.forEach((unit: any) => {
        unit.skills?.forEach((skill: any) => {
          totalCount += skill.lessons?.length || 0;
        });
      });

      // 下载每个课程的练习题
      for (const unit of structure.units || []) {
        for (const skill of unit.skills || []) {
          for (const lesson of skill.lessons || []) {
            try {
              const exercises = await api.get(`/learning/lessons/${lesson.id}/exercises`);
              
              const lessonContent = {
                id: `lesson_${lesson.id}`,
                type: 'lesson' as const,
                data: {
                  lesson,
                  exercises: exercises.data.exercises
                },
                downloadedAt: new Date(),
                lastUpdated: new Date(),
                size: JSON.stringify(exercises.data.exercises).length
              };

              await this.saveContent(lessonContent);
              totalSize += lessonContent.size;
              downloadedCount++;

              // 触发进度更新事件
              window.dispatchEvent(new CustomEvent('offline-download-progress', {
                detail: {
                  courseId,
                  progress: (downloadedCount / totalCount) * 100,
                  downloadedCount,
                  totalCount,
                  currentLesson: lesson.name
                }
              }));

              // 添加小延迟避免过快请求
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              console.error(`下载课程 ${lesson.id} 失败:`, error);
            }
          }
        }
      }

      // 保存下载元数据
      await this.saveUserData('downloaded_courses', {
        [courseId]: {
          downloadedAt: new Date(),
          totalSize,
          lessonCount: downloadedCount
        }
      });

      console.log(`✅ 课程下载完成: ${courseId}, 总大小: ${totalSize} bytes`);
      
      // 触发下载完成事件
      window.dispatchEvent(new CustomEvent('offline-download-complete', {
        detail: { courseId, totalSize, lessonCount: downloadedCount }
      }));

    } catch (error) {
      console.error('下载课程失败:', error);
      throw new Error('Failed to download course content');
    }
  }

  /**
   * 获取离线课程结构
   */
  async getOfflineCourse(courseId: string): Promise<any> {
    const content = await this.getContent(`course_${courseId}`);
    return content?.data || null;
  }

  /**
   * 获取离线课程内容
   */
  async getOfflineLesson(lessonId: string): Promise<any> {
    const content = await this.getContent(`lesson_${lessonId}`);
    return content?.data || null;
  }

  /**
   * 检查内容是否已下载
   */
  async isContentDownloaded(courseId: string): Promise<boolean> {
    const content = await this.getContent(`course_${courseId}`);
    return !!content;
  }

  /**
   * 获取已下载的课程列表
   */
  async getDownloadedCourses(): Promise<string[]> {
    const userData = await this.getUserData('downloaded_courses');
    return Object.keys(userData || {});
  }

  /**
   * 删除离线内容
   */
  async deleteOfflineContent(courseId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['content', 'userData'], 'readwrite');
    const contentStore = transaction.objectStore('content');
    const userDataStore = transaction.objectStore('userData');

    // 删除课程相关的所有内容
    const courseStructure = await this.getOfflineCourse(courseId);
    if (courseStructure) {
      // 删除课程结构
      await contentStore.delete(`course_${courseId}`);

      // 删除所有课程内容
      courseStructure.units?.forEach((unit: any) => {
        unit.skills?.forEach((skill: any) => {
          skill.lessons?.forEach((lesson: any) => {
            contentStore.delete(`lesson_${lesson.id}`);
          });
        });
      });
    }

    // 更新下载记录
    const downloadedCourses = await this.getUserData('downloaded_courses') || {};
    delete downloadedCourses[courseId];
    await userDataStore.put({ key: 'downloaded_courses', value: downloadedCourses });

    console.log(`🗑️ 已删除离线内容: ${courseId}`);
  }

  /**
   * 保存离线学习进度
   */
  async saveOfflineProgress(progress: OfflineProgress): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['progress'], 'readwrite');
    const store = transaction.objectStore('progress');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(progress);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取离线学习进度
   */
  async getOfflineProgress(sessionId: string): Promise<OfflineProgress | null> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['progress'], 'readonly');
    const store = transaction.objectStore('progress');
    
    return new Promise((resolve, reject) => {
      const request = store.get(sessionId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取所有待同步的进度
   */
  async getPendingProgress(): Promise<OfflineProgress[]> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['progress'], 'readonly');
    const store = transaction.objectStore('progress');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const allProgress = request.result || [];
        // 只返回已完成但未同步的进度
        const pending = allProgress.filter(p => p.isCompleted);
        resolve(pending);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 同步离线进度到服务器
   */
  async syncOfflineProgress(): Promise<void> {
    try {
      const pendingProgress = await this.getPendingProgress();
      
      if (pendingProgress.length === 0) {
        console.log('📡 没有待同步的离线进度');
        return;
      }

      console.log(`📡 开始同步 ${pendingProgress.length} 个离线进度`);

      for (const progress of pendingProgress) {
        try {
          // 提交到服务器
          await api.post('/learning/sessions/sync', {
            sessionId: progress.sessionId,
            lessonId: progress.lessonId,
            answers: progress.answers,
            completedAt: new Date(),
            isOffline: true
          });

          // 同步成功后删除本地记录
          await this.deleteOfflineProgress(progress.sessionId);
          
          console.log(`✅ 同步完成: ${progress.sessionId}`);
        } catch (error) {
          console.error(`同步失败: ${progress.sessionId}`, error);
        }
      }

      // 触发同步完成事件
      window.dispatchEvent(new CustomEvent('offline-sync-complete', {
        detail: { syncedCount: pendingProgress.length }
      }));

    } catch (error) {
      console.error('同步离线进度失败:', error);
      throw new Error('Failed to sync offline progress');
    }
  }

  /**
   * 删除离线进度记录
   */
  async deleteOfflineProgress(sessionId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['progress'], 'readwrite');
    const store = transaction.objectStore('progress');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(sessionId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取离线存储使用情况
   */
  async getStorageUsage(): Promise<{
    totalSize: number;
    contentCount: number;
    progressCount: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['content', 'progress'], 'readonly');
    const contentStore = transaction.objectStore('content');
    const progressStore = transaction.objectStore('progress');

    const [contents, progresses] = await Promise.all([
      new Promise<OfflineContent[]>((resolve, reject) => {
        const request = contentStore.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      }),
      new Promise<OfflineProgress[]>((resolve, reject) => {
        const request = progressStore.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      })
    ]);

    const totalSize = contents.reduce((sum, content) => sum + content.size, 0);

    return {
      totalSize,
      contentCount: contents.length,
      progressCount: progresses.length
    };
  }

  /**
   * 清理过期内容
   */
  async cleanupExpiredContent(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['content'], 'readwrite');
    const store = transaction.objectStore('content');
    const index = store.index('downloadedAt');

    const cutoffDate = new Date(Date.now() - maxAge);
    const range = IDBKeyRange.upperBound(cutoffDate);

    await new Promise<void>((resolve, reject) => {
      const request = index.openCursor(range);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });

    console.log('🧹 清理过期离线内容完成');
  }

  // 私有辅助方法
  private async saveContent(content: OfflineContent): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['content'], 'readwrite');
    const store = transaction.objectStore('content');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(content);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getContent(id: string): Promise<OfflineContent | null> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['content'], 'readonly');
    const store = transaction.objectStore('content');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async saveUserData(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['userData'], 'readwrite');
    const store = transaction.objectStore('userData');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getUserData(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['userData'], 'readonly');
    const store = transaction.objectStore('userData');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => reject(request.error);
    });
  }
}

// 导出单例实例
export const offlineService = new OfflineService();

// 初始化离线服务
offlineService.init().catch(console.error);