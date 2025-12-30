import { UserData, UserProfile, UserStats } from '../models/User';

export interface IUser {
  create(userData: UserData): Promise<UserData>;
  findByEmail(email: string): Promise<UserData | null>;
  findByUsername(username: string): Promise<UserData | null>;
  findById(id: string): Promise<UserData | null>;
  validatePassword(password: string, hash: string): Promise<boolean>;
  verifyEmail(verification_token: string): Promise<boolean>;
  updateUser(id: string, updateData: Partial<UserData>): Promise<UserData | null>;
  getUserWithProfile(id: string): Promise<any>;
  updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null>;
  updateStats(userId: string, statsData: Partial<UserStats>): Promise<UserStats | null>;
  addXP(userId: string, xp: number): Promise<void>;
  updateStreak(userId: string): Promise<void>;
  loseHeart(userId: string): Promise<number>;
  restoreHearts(userId: string, amount?: number): Promise<number>;
  spendGems(userId: string, amount: number): Promise<boolean>;
  earnGems(userId: string, amount: number): Promise<number>;
  deleteUser(id: string): Promise<boolean>;
  generatePasswordResetToken(email: string): Promise<string | null>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
}