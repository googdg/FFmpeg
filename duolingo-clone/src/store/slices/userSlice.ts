import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserStats {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  hearts: number;
  gems: number;
  level: number;
  lessonsCompleted: number;
  lastActivityDate: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  unlockedAt: string;
}

export interface UserState {
  stats: UserStats;
  achievements: Achievement[];
  weeklyProgress: Array<{
    date: string;
    xpEarned: number;
    lessonsCompleted: number;
  }>;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  stats: {
    totalXP: 0,
    currentStreak: 0,
    longestStreak: 0,
    hearts: 5,
    gems: 0,
    level: 1,
    lessonsCompleted: 0,
    lastActivityDate: new Date().toISOString().split('T')[0],
  },
  achievements: [],
  weeklyProgress: [],
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateStats: (state, action: PayloadAction<Partial<UserStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    addXP: (state, action: PayloadAction<number>) => {
      state.stats.totalXP += action.payload;
      // Calculate level based on XP (100 XP per level)
      state.stats.level = Math.floor(state.stats.totalXP / 100) + 1;
    },
    loseHeart: (state) => {
      if (state.stats.hearts > 0) {
        state.stats.hearts -= 1;
      }
    },
    gainHeart: (state) => {
      if (state.stats.hearts < 5) {
        state.stats.hearts += 1;
      }
    },
    addGems: (state, action: PayloadAction<number>) => {
      state.stats.gems += action.payload;
    },
    spendGems: (state, action: PayloadAction<number>) => {
      if (state.stats.gems >= action.payload) {
        state.stats.gems -= action.payload;
      }
    },
    updateStreak: (state, action: PayloadAction<number>) => {
      state.stats.currentStreak = action.payload;
      if (action.payload > state.stats.longestStreak) {
        state.stats.longestStreak = action.payload;
      }
    },
    completeLesson: (state) => {
      state.stats.lessonsCompleted += 1;
      state.stats.lastActivityDate = new Date().toISOString().split('T')[0];
    },
    addAchievement: (state, action: PayloadAction<Achievement>) => {
      const exists = state.achievements.find(a => a.id === action.payload.id);
      if (!exists) {
        state.achievements.push(action.payload);
      }
    },
    updateWeeklyProgress: (state, action: PayloadAction<UserState['weeklyProgress']>) => {
      state.weeklyProgress = action.payload;
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
  updateStats,
  addXP,
  loseHeart,
  gainHeart,
  addGems,
  spendGems,
  updateStreak,
  completeLesson,
  addAchievement,
  updateWeeklyProgress,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;