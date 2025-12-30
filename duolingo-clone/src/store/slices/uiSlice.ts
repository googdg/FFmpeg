import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  isVisible: boolean;
}

export interface Modal {
  id: string;
  type: 'achievement' | 'hearts_depleted' | 'lesson_complete' | 'level_up' | 'streak_freeze';
  isOpen: boolean;
  data?: any;
}

export interface UIState {
  // Navigation
  sidebarOpen: boolean;
  
  // Notifications
  notifications: Notification[];
  
  // Modals
  modals: Modal[];
  
  // Loading states
  globalLoading: boolean;
  
  // Theme and preferences
  theme: 'light' | 'dark';
  language: string;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  
  // Mobile responsiveness
  isMobile: boolean;
  screenSize: 'sm' | 'md' | 'lg' | 'xl';
}

const initialState: UIState = {
  sidebarOpen: false,
  notifications: [],
  modals: [],
  globalLoading: false,
  theme: 'light',
  language: 'en',
  soundEnabled: true,
  animationsEnabled: true,
  isMobile: false,
  screenSize: 'lg',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    // Notifications
    addNotification: {
      reducer: (state, action: PayloadAction<Notification>) => {
        state.notifications.push(action.payload);
      },
      prepare: (payload: Omit<Notification, 'id' | 'isVisible'>) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        return {
          payload: {
            ...payload,
            id,
            isVisible: true,
            duration: payload.duration || 2000,
          },
        };
      },
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    hideNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.isVisible = false;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Modals
    openModal: (state, action: PayloadAction<Omit<Modal, 'id' | 'isOpen'>>) => {
      const modal: Modal = {
        ...action.payload,
        id: Date.now().toString(),
        isOpen: true,
      };
      state.modals.push(modal);
    },
    closeModal: (state, action: PayloadAction<string>) => {
      const modal = state.modals.find(m => m.id === action.payload);
      if (modal) {
        modal.isOpen = false;
      }
    },
    closeModalByType: (state, action: PayloadAction<Modal['type']>) => {
      const modal = state.modals.find(m => m.type === action.payload);
      if (modal) {
        modal.isOpen = false;
      }
    },
    removeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(m => m.id !== action.payload);
    },
    clearModals: (state) => {
      state.modals = [];
    },
    
    // Loading
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    
    // Theme and preferences
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.soundEnabled = action.payload;
    },
    setAnimationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.animationsEnabled = action.payload;
    },
    
    // Responsive
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
    },
    setScreenSize: (state, action: PayloadAction<UIState['screenSize']>) => {
      state.screenSize = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  hideNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeModalByType,
  removeModal,
  clearModals,
  setGlobalLoading,
  setTheme,
  setLanguage,
  setSoundEnabled,
  setAnimationsEnabled,
  setIsMobile,
  setScreenSize,
} = uiSlice.actions;

export default uiSlice.reducer;