import { BaseModel } from './BaseModel';
import { IUser } from '../interfaces/IUser';

export interface CourseData {
  id?: string;
  name: string;
  description?: string;
  language_from: string;
  language_to: string;
  difficulty_level?: number;
  icon_url?: string;
  is_active?: boolean;
  order_index?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface UnitData {
  id?: string;
  course_id: string;
  name: string;
  description?: string;
  order_index: number;
  unlock_requirement?: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface SkillData {
  id?: string;
  unit_id: string;
  name: string;
  description?: string;
  icon_url?: string;
  order_index: number;
  difficulty_level?: number;
  unlock_requirement?: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface LessonData {
  id?: string;
  skill_id: string;
  name: string;
  type: 'lesson' | 'practice' | 'story' | 'test';
  order_index: number;
  xp_reward?: number;
  hearts_cost?: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface ExerciseData {
  id?: string;
  lesson_id: string;
  type: 'multiple_choice' | 'translation' | 'listening' | 'speaking' | 'fill_blank' | 'word_order';
  question: string;
  correct_answer: string;
  options?: string[];
  audio_url?: string;
  image_url?: string;
  difficulty_level?: number;
  order_index: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// 模拟数据存储
const mockCourses: Map<string, CourseData> = new Map();
const mockUnits: Map<string, UnitData> = new Map();
const mockSkills: Map<string, SkillData> = new Map();
const mockLessons: Map<string, LessonData> = new Map();
const mockExercises: Map<string, ExerciseData> = new Map();

// 初始化示例数据
function initializeMockData() {
  // 创建示例课程
  const course: CourseData = {
    id: 'course-1',
    name: '英语基础课程',
    description: '从零开始学习英语基础知识',
    language_from: 'zh-CN',
    language_to: 'en',
    difficulty_level: 1,
    order_index: 1,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  };
  mockCourses.set('course-1', course);

  // 创建示例单元
  const unit: UnitData = {
    id: 'unit-1',
    course_id: 'course-1',
    name: '基础词汇',
    description: '学习日常生活中的基础英语词汇',
    order_index: 1,
    unlock_requirement: 0,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  };
  mockUnits.set('unit-1', unit);

  // 创建示例技能
  const skill: SkillData = {
    id: 'skill-1',
    unit_id: 'unit-1',
    name: '问候语',
    description: '学习基本的问候和告别用语',
    order_index: 1,
    difficulty_level: 1,
    unlock_requirement: 0,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  };
  mockSkills.set('skill-1', skill);

  // 创建示例课程
  const lesson: LessonData = {
    id: 'lesson-1',
    skill_id: 'skill-1',
    name: '基础问候',
    type: 'lesson',
    order_index: 1,
    xp_reward: 10,
    hearts_cost: 0,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  };
  mockLessons.set('lesson-1', lesson);

  // 创建示例练习题
  const exercises: ExerciseData[] = [
    {
      id: 'exercise-1',
      lesson_id: 'lesson-1',
      type: 'multiple_choice',
      question: '如何用英语说"你好"？',
      correct_answer: 'Hello',
      options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
      order_index: 1,
      difficulty_level: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'exercise-2',
      lesson_id: 'lesson-1',
      type: 'translation',
      question: '请翻译：你好吗？',
      correct_answer: 'How are you?',
      order_index: 2,
      difficulty_level: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'exercise-3',
      lesson_id: 'lesson-1',
      type: 'fill_blank',
      question: '填空：Good _____ (早上)',
      correct_answer: 'morning',
      order_index: 3,
      difficulty_level: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'exercise-4',
      lesson_id: 'lesson-1',
      type: 'word_order',
      question: '重新排列单词：are / How / you / ?',
      correct_answer: 'How are you?',
      options: ['How', 'are', 'you', '?'],
      order_index: 4,
      difficulty_level: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'exercise-5',
      lesson_id: 'lesson-1',
      type: 'listening',
      question: '听音频并选择正确答案',
      correct_answer: 'Hello',
      options: ['Hello', 'Help', 'Hill', 'Hall'],
      audio_url: '/audio/hello.mp3',
      order_index: 5,
      difficulty_level: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  exercises.forEach(exercise => {
    mockExercises.set(exercise.id!, exercise);
  });
}

// 初始化数据
initializeMockData();

export class MockCourse {
  /**
   * 获取所有课程
   */
  async getAllCourses(): Promise<CourseData[]> {
    return Array.from(mockCourses.values());
  }

  /**
   * 根据ID获取课程
   */
  async getCourseById(id: string): Promise<CourseData | null> {
    return mockCourses.get(id) || null;
  }

  /**
   * 获取课程的所有单元
   */
  async getUnitsByCourseId(courseId: string): Promise<UnitData[]> {
    return Array.from(mockUnits.values())
      .filter(unit => unit.course_id === courseId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  /**
   * 获取单元的所有技能
   */
  async getSkillsByUnitId(unitId: string): Promise<SkillData[]> {
    return Array.from(mockSkills.values())
      .filter(skill => skill.unit_id === unitId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  /**
   * 获取技能的所有课程
   */
  async getLessonsBySkillId(skillId: string): Promise<LessonData[]> {
    return Array.from(mockLessons.values())
      .filter(lesson => lesson.skill_id === skillId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  /**
   * 获取课程的所有练习题
   */
  async getExercisesByLessonId(lessonId: string): Promise<ExerciseData[]> {
    return Array.from(mockExercises.values())
      .filter(exercise => exercise.lesson_id === lessonId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  /**
   * 根据ID获取练习题
   */
  async getExerciseById(id: string): Promise<ExerciseData | null> {
    return mockExercises.get(id) || null;
  }

  /**
   * 获取完整的课程结构
   */
  async getCourseStructure(courseId: string): Promise<any> {
    const course = await this.getCourseById(courseId);
    if (!course) return null;

    const units = await this.getUnitsByCourseId(courseId);
    
    const courseStructure = {
      ...course,
      units: await Promise.all(units.map(async (unit) => {
        const skills = await this.getSkillsByUnitId(unit.id!);
        return {
          ...unit,
          skills: await Promise.all(skills.map(async (skill) => {
            const lessons = await this.getLessonsBySkillId(skill.id!);
            return {
              ...skill,
              lessons: lessons
            };
          }))
        };
      }))
    };

    return courseStructure;
  }

  /**
   * 验证答案
   */
  async validateAnswer(exerciseId: string, userAnswer: string): Promise<{
    correct: boolean;
    correctAnswer: string;
    explanation?: string;
  }> {
    const exercise = await this.getExerciseById(exerciseId);
    if (!exercise) {
      throw new Error('Exercise not found');
    }

    const correct = this.normalizeAnswer(userAnswer) === this.normalizeAnswer(exercise.correct_answer);
    
    return {
      correct,
      correctAnswer: exercise.correct_answer,
      explanation: correct ? '正确！' : `正确答案是：${exercise.correct_answer}`
    };
  }

  /**
   * 标准化答案（去除空格、转换大小写等）
   */
  private normalizeAnswer(answer: string): string {
    return answer.toLowerCase().trim().replace(/[^\w\s]/g, '');
  }
}