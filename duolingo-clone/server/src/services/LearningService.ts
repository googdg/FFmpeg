import { MockCourse, CourseData, ExerciseData, LessonData } from '../models/Course';
import { IUser } from '../interfaces/IUser';
import { MockUser } from '../models/MockUser';
import { User } from '../models/User';
import { gameificationService } from './GameificationService';

export interface LearningSession {
  id: string;
  userId: string;
  lessonId: string;
  exercises: ExerciseData[];
  currentExerciseIndex: number;
  startedAt: Date;
  completedAt?: Date;
  xpEarned: number;
  heartsLost: number;
  exercisesCompleted: number;
  exercisesCorrect: number;
  timeSpent: number; // 秒数
  isCompleted: boolean;
}

export interface ExerciseResult {
  exerciseId: string;
  userAnswer: string;
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  xpEarned: number;
  heartsLost: number;
  timeSpent: number;
}

// 模拟学习会话存储
const mockSessions: Map<string, LearningSession> = new Map();

export class LearningService {
  private courseModel: MockCourse;
  private userModel: IUser;

  constructor() {
    this.courseModel = new MockCourse();
    // 在开发环境中使用模拟用户，生产环境使用真实数据库
    const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';
    const dbRequired = process.env.DB_REQUIRED === 'true';
    
    this.userModel = isDevelopment && !dbRequired 
      ? new MockUser() 
      : new User();
  }

  /**
   * 获取所有可用课程
   */
  async getAvailableCourses(): Promise<CourseData[]> {
    return await this.courseModel.getAllCourses();
  }

  /**
   * 获取课程完整结构
   */
  async getCourseStructure(courseId: string, userId?: string): Promise<any> {
    const courseStructure = await this.courseModel.getCourseStructure(courseId);
    
    if (!courseStructure) {
      throw new Error('Course not found');
    }

    // 如果提供了用户ID，添加用户进度信息
    if (userId) {
      // TODO: 添加用户进度逻辑
      // const userProgress = await this.getUserProgress(userId, courseId);
      // courseStructure.userProgress = userProgress;
    }

    return courseStructure;
  }

  /**
   * 开始学习会话
   */
  async startLearningSession(userId: string, lessonId: string): Promise<{
    sessionId: string;
    lesson: LessonData;
    exercises: ExerciseData[];
    currentExercise: ExerciseData;
  }> {
    // 获取课程练习题
    const exercises = await this.courseModel.getExercisesByLessonId(lessonId);
    
    if (exercises.length === 0) {
      throw new Error('No exercises found for this lesson');
    }

    // 创建学习会话
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session: LearningSession = {
      id: sessionId,
      userId,
      lessonId,
      exercises,
      currentExerciseIndex: 0,
      startedAt: new Date(),
      xpEarned: 0,
      heartsLost: 0,
      exercisesCompleted: 0,
      exercisesCorrect: 0,
      timeSpent: 0,
      isCompleted: false
    };

    mockSessions.set(sessionId, session);

    // 获取课程信息（模拟）
    const lesson: LessonData = {
      id: lessonId,
      skill_id: 'skill-1',
      name: '基础问候',
      type: 'lesson',
      order_index: 1,
      xp_reward: 10,
      hearts_cost: 0,
      is_active: true
    };

    return {
      sessionId,
      lesson,
      exercises: exercises.map(ex => ({
        ...ex,
        correct_answer: undefined // 不返回正确答案给前端
      })) as ExerciseData[],
      currentExercise: {
        ...exercises[0],
        correct_answer: undefined
      } as ExerciseData
    };
  }

  /**
   * 提交练习题答案
   */
  async submitExerciseAnswer(
    sessionId: string,
    exerciseId: string,
    userAnswer: string,
    timeSpent: number = 0
  ): Promise<ExerciseResult> {
    const session = mockSessions.get(sessionId);
    if (!session) {
      throw new Error('Learning session not found');
    }

    if (session.isCompleted) {
      throw new Error('Learning session already completed');
    }

    // 验证答案
    const validation = await this.courseModel.validateAnswer(exerciseId, userAnswer);
    
    // 计算奖励和惩罚
    const exercise = session.exercises.find(ex => ex.id === exerciseId);
    const xpEarned = validation.correct 
      ? gameificationService.calculateXPReward(exercise?.type || 'multiple_choice', true, exercise?.difficulty_level || 1)
      : 0;
    const heartsLost = validation.correct ? 0 : 1;

    // 更新会话状态
    session.exercisesCompleted++;
    session.timeSpent += timeSpent;
    
    if (validation.correct) {
      session.exercisesCorrect++;
      session.xpEarned += xpEarned;
    } else {
      session.heartsLost += heartsLost;
      // 扣除用户生命值
      await this.userModel.loseHeart(session.userId);
    }

    // 移动到下一个练习题
    session.currentExerciseIndex++;

    // 检查是否完成所有练习题
    if (session.currentExerciseIndex >= session.exercises.length) {
      session.isCompleted = true;
      session.completedAt = new Date();
      
      // 给用户添加XP并检查成就
      if (session.xpEarned > 0) {
        const xpResult = await gameificationService.addXP(session.userId, session.xpEarned);
        
        // 检查XP相关成就
        await gameificationService.checkXPAchievements(session.userId, xpResult.totalXP);
        
        // 更新每日目标进度
        await gameificationService.updateDailyGoalProgress(session.userId, session.xpEarned);
      }
      
      // 更新连击并检查相关成就
      await gameificationService.updateStreak(session.userId);
      
      // 检查课程完成成就
      const isPerfect = session.exercisesCorrect === session.exercises.length;
      await gameificationService.checkLessonAchievements(session.userId, 1, isPerfect);
    }

    const result: ExerciseResult = {
      exerciseId,
      userAnswer,
      correct: validation.correct,
      correctAnswer: validation.correctAnswer,
      explanation: validation.explanation || '',
      xpEarned,
      heartsLost,
      timeSpent
    };

    return result;
  }

  /**
   * 获取学习会话状态
   */
  async getLearningSession(sessionId: string): Promise<{
    session: LearningSession;
    currentExercise?: ExerciseData;
    nextExercise?: ExerciseData;
    progress: {
      completed: number;
      total: number;
      percentage: number;
    };
  }> {
    const session = mockSessions.get(sessionId);
    if (!session) {
      throw new Error('Learning session not found');
    }

    const currentExercise = session.currentExerciseIndex < session.exercises.length 
      ? {
          ...session.exercises[session.currentExerciseIndex],
          correct_answer: undefined // 不返回正确答案
        } as ExerciseData
      : undefined;

    const nextExercise = session.currentExerciseIndex + 1 < session.exercises.length
      ? {
          ...session.exercises[session.currentExerciseIndex + 1],
          correct_answer: undefined // 不返回正确答案
        } as ExerciseData
      : undefined;

    const progress = {
      completed: session.exercisesCompleted,
      total: session.exercises.length,
      percentage: Math.round((session.exercisesCompleted / session.exercises.length) * 100)
    };

    return {
      session,
      currentExercise,
      nextExercise,
      progress
    };
  }

  /**
   * 完成学习会话
   */
  async completeLearningSession(sessionId: string): Promise<{
    session: LearningSession;
    summary: {
      xpEarned: number;
      heartsLost: number;
      accuracy: number;
      timeSpent: number;
      exercisesCompleted: number;
      exercisesCorrect: number;
    };
  }> {
    const session = mockSessions.get(sessionId);
    if (!session) {
      throw new Error('Learning session not found');
    }

    if (!session.isCompleted) {
      session.isCompleted = true;
      session.completedAt = new Date();
    }

    const accuracy = session.exercisesCompleted > 0 
      ? Math.round((session.exercisesCorrect / session.exercisesCompleted) * 100)
      : 0;

    const summary = {
      xpEarned: session.xpEarned,
      heartsLost: session.heartsLost,
      accuracy,
      timeSpent: session.timeSpent,
      exercisesCompleted: session.exercisesCompleted,
      exercisesCorrect: session.exercisesCorrect
    };

    return {
      session,
      summary
    };
  }

  /**
   * 获取用户学习统计
   */
  async getUserLearningStats(userId: string): Promise<{
    totalXP: number;
    currentStreak: number;
    longestStreak: number;
    lessonsCompleted: number;
    exercisesCompleted: number;
    correctAnswers: number;
    accuracy: number;
    hearts: number;
    gems: number;
    level: number;
  }> {
    const user = await this.userModel.getUserWithProfile(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const accuracy = user.exercises_completed > 0 
      ? Math.round((user.correct_answers / user.exercises_completed) * 100)
      : 0;

    return {
      totalXP: user.total_xp || 0,
      currentStreak: user.current_streak || 0,
      longestStreak: user.longest_streak || 0,
      lessonsCompleted: user.lessons_completed || 0,
      exercisesCompleted: user.exercises_completed || 0,
      correctAnswers: user.correct_answers || 0,
      accuracy,
      hearts: user.hearts || 5,
      gems: user.gems || 500,
      level: user.level || 1
    };
  }

  /**
   * 获取推荐的下一个课程
   */
  async getRecommendedLesson(userId: string, courseId: string): Promise<LessonData | null> {
    // 简单实现：返回第一个课程
    const courseStructure = await this.courseModel.getCourseStructure(courseId);
    
    if (courseStructure && courseStructure.units.length > 0) {
      const firstUnit = courseStructure.units[0];
      if (firstUnit.skills.length > 0) {
        const firstSkill = firstUnit.skills[0];
        if (firstSkill.lessons.length > 0) {
          return firstSkill.lessons[0];
        }
      }
    }

    return null;
  }
}

// 导出单例实例
export const learningService = new LearningService();  
/**
   * 获取课程练习题
   */
  async getLessonExercises(lessonId: string): Promise<ExerciseData[]> {
    try {
      const exercises = await this.courseModel.getExercisesByLesson(lessonId);
      return exercises;
    } catch (error) {
      console.error('Error getting lesson exercises:', error);
      throw new Error('Failed to get lesson exercises');
    }
  }

  /**
   * 更新用户XP（模拟）
   */
  async updateUserXP(userId: string, xp: number): Promise<void> {
    try {
      console.log(`📈 用户 ${userId} 获得 ${xp} XP`);
      // 在实际应用中会调用用户模型更新XP
    } catch (error) {
      console.error('Error updating user XP:', error);
    }
  }

  /**
   * 更新用户连击（模拟）
   */
  async updateUserStreak(userId: string): Promise<void> {
    try {
      console.log(`🔥 用户 ${userId} 连击更新`);
      // 在实际应用中会调用用户模型更新连击
    } catch (error) {
      console.error('Error updating user streak:', error);
    }
  }