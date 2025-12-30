import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/api' 
  : 'http://localhost:3001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service class
export class APIService {
  // Authentication endpoints
  static async login(credentials: { email: string; password: string }) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  static async register(userData: {
    email: string;
    username: string;
    password: string;
    nativeLanguage: string;
  }) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }

  static async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }

  static async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }

  static async refreshToken(refreshToken: string) {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  // User endpoints
  static async getUserStats() {
    const response = await apiClient.get('/users/stats');
    return response.data;
  }

  static async updateUserStats(stats: any) {
    const response = await apiClient.patch('/users/stats', stats);
    return response.data;
  }

  static async getUserAchievements() {
    const response = await apiClient.get('/users/achievements');
    return response.data;
  }

  static async getWeeklyProgress() {
    const response = await apiClient.get('/users/progress/weekly');
    return response.data;
  }

  // Course endpoints
  static async getCourses() {
    const response = await apiClient.get('/courses');
    return response.data;
  }

  static async getCourse(courseId: string) {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
  }

  // Learning endpoints
  static async getCourses() {
    const response = await apiClient.get('/learning/courses');
    return response.data;
  }

  static async getCourseStructure(courseId: string) {
    const response = await apiClient.get(`/learning/courses/${courseId}`);
    return response.data;
  }

  static async getRecommendedLesson(courseId: string) {
    const response = await apiClient.get(`/learning/courses/${courseId}/recommended`);
    return response.data;
  }

  static async startLearningSession(lessonId: string) {
    const response = await apiClient.post('/learning/lessons/start', { lessonId });
    return response.data;
  }

  static async submitExerciseAnswer(sessionId: string, exerciseId: string, userAnswer: string, timeSpent: number = 0) {
    const response = await apiClient.post('/learning/exercises/submit', {
      sessionId,
      exerciseId,
      userAnswer,
      timeSpent,
    });
    return response.data;
  }

  static async getLearningSession(sessionId: string) {
    const response = await apiClient.get(`/learning/sessions/${sessionId}`);
    return response.data;
  }

  static async completeLearningSession(sessionId: string) {
    const response = await apiClient.post(`/learning/sessions/${sessionId}/complete`);
    return response.data;
  }

  static async getLearningStats() {
    const response = await apiClient.get('/learning/stats');
    return response.data;
  }

  // Gamification endpoints
  static async getAchievements() {
    const response = await apiClient.get('/gamification/achievements');
    return response.data;
  }

  static async getEarnedAchievements() {
    const response = await apiClient.get('/gamification/achievements/earned');
    return response.data;
  }

  static async getLeaderboard(type: 'weekly' | 'monthly' | 'allTime', limit: number = 10) {
    const response = await apiClient.get(`/gamification/leaderboard/${type}?limit=${limit}`);
    return response.data;
  }

  static async getUserRank(type: 'weekly' | 'monthly' | 'allTime') {
    const response = await apiClient.get(`/gamification/leaderboard/${type}/rank`);
    return response.data;
  }

  static async setDailyGoal(targetXP: number) {
    const response = await apiClient.post('/gamification/daily-goal', { targetXP });
    return response.data;
  }

  static async getDailyGoal() {
    const response = await apiClient.get('/gamification/daily-goal');
    return response.data;
  }

  static async getGameificationStats() {
    const response = await apiClient.get('/gamification/stats');
    return response.data;
  }
}

// Export the axios instance as 'api' for direct use
export const api = apiClient;

export default APIService;