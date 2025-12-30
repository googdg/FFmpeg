import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Exercise {
  id: string;
  type: 'multiple_choice' | 'translation' | 'listening' | 'speaking' | 'fill_blank' | 'word_order';
  question: string;
  correctAnswer: string;
  options?: string[];
  audioUrl?: string;
  imageUrl?: string;
  hint?: string;
  explanation?: string;
}

export interface Lesson {
  id: string;
  skillId: string;
  name: string;
  type: 'lesson' | 'practice' | 'story' | 'test';
  exercises: Exercise[];
  xpReward: number;
  orderIndex: number;
}

export interface Skill {
  id: string;
  unitId: string;
  name: string;
  description: string;
  iconUrl: string;
  level: number; // 0: locked, 1-5: skill levels
  xpEarned: number;
  lessonsCompleted: number;
  totalLessons: number;
  strength: number; // 0.0-1.0
  isAvailable: boolean;
  orderIndex: number;
}

export interface Unit {
  id: string;
  courseId: string;
  name: string;
  description: string;
  skills: Skill[];
  orderIndex: number;
  unlockRequirement: number;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  languageFrom: string;
  languageTo: string;
  units: Unit[];
  totalXP: number;
  completionPercentage: number;
}

export interface LearningSession {
  id: string;
  lessonId: string;
  currentExerciseIndex: number;
  exercises: Exercise[];
  answers: Array<{
    exerciseId: string;
    userAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
  }>;
  xpEarned: number;
  heartsLost: number;
  startedAt: string;
  isCompleted: boolean;
}

export interface LearningState {
  currentCourse: Course | null;
  currentSession: LearningSession | null;
  isLessonActive: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: LearningState = {
  currentCourse: null,
  currentSession: null,
  isLessonActive: false,
  isLoading: false,
  error: null,
};

const learningSlice = createSlice({
  name: 'learning',
  initialState,
  reducers: {
    setCourse: (state, action: PayloadAction<Course>) => {
      state.currentCourse = action.payload;
    },
    startLesson: (state, action: PayloadAction<{ lesson: Lesson; sessionId: string }>) => {
      const { lesson, sessionId } = action.payload;
      state.currentSession = {
        id: sessionId,
        lessonId: lesson.id,
        currentExerciseIndex: 0,
        exercises: lesson.exercises,
        answers: [],
        xpEarned: 0,
        heartsLost: 0,
        startedAt: new Date().toISOString(),
        isCompleted: false,
      };
      state.isLessonActive = true;
    },
    submitAnswer: (
      state,
      action: PayloadAction<{
        exerciseId: string;
        userAnswer: string;
        isCorrect: boolean;
        timeSpent: number;
        xpEarned?: number;
        heartsLost?: number;
      }>
    ) => {
      if (!state.currentSession) return;

      const { exerciseId, userAnswer, isCorrect, timeSpent, xpEarned = 0, heartsLost = 0 } = action.payload;
      
      state.currentSession.answers.push({
        exerciseId,
        userAnswer,
        isCorrect,
        timeSpent,
      });

      state.currentSession.xpEarned += xpEarned;
      state.currentSession.heartsLost += heartsLost;
    },
    nextExercise: (state) => {
      if (!state.currentSession) return;
      
      if (state.currentSession.currentExerciseIndex < state.currentSession.exercises.length - 1) {
        state.currentSession.currentExerciseIndex += 1;
      }
    },
    completeLesson: (state) => {
      if (!state.currentSession) return;
      
      state.currentSession.isCompleted = true;
      state.isLessonActive = false;
    },
    endSession: (state) => {
      state.currentSession = null;
      state.isLessonActive = false;
    },
    updateSkillProgress: (
      state,
      action: PayloadAction<{
        skillId: string;
        level?: number;
        xpEarned?: number;
        lessonsCompleted?: number;
        strength?: number;
      }>
    ) => {
      if (!state.currentCourse) return;

      const { skillId, level, xpEarned, lessonsCompleted, strength } = action.payload;
      
      for (const unit of state.currentCourse.units) {
        const skill = unit.skills.find(s => s.id === skillId);
        if (skill) {
          if (level !== undefined) skill.level = level;
          if (xpEarned !== undefined) skill.xpEarned += xpEarned;
          if (lessonsCompleted !== undefined) skill.lessonsCompleted = lessonsCompleted;
          if (strength !== undefined) skill.strength = strength;
          break;
        }
      }
    },
    unlockNextSkill: (state, action: PayloadAction<string>) => {
      if (!state.currentCourse) return;

      const completedSkillId = action.payload;
      
      // Find the completed skill and unlock the next one
      for (const unit of state.currentCourse.units) {
        const skillIndex = unit.skills.findIndex(s => s.id === completedSkillId);
        if (skillIndex !== -1 && skillIndex < unit.skills.length - 1) {
          unit.skills[skillIndex + 1].isAvailable = true;
          break;
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCourse,
  startLesson,
  submitAnswer,
  nextExercise,
  completeLesson,
  endSession,
  updateSkillProgress,
  unlockNextSkill,
  setLoading,
  setError,
} = learningSlice.actions;

export default learningSlice.reducer;