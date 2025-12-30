import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './redux';
import { loginUser, registerUser, logoutUser, clearError } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    try {
      const result = await dispatch(loginUser(credentials));
      if (loginUser.fulfilled.match(result)) {
        // Store user data for persistence
        localStorage.setItem('userData', JSON.stringify(result.payload.user));
        navigate('/learn');
        return { success: true };
      } else {
        return { success: false, error: result.payload as string };
      }
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }, [dispatch, navigate]);

  const register = useCallback(async (userData: {
    email: string;
    username: string;
    password: string;
    nativeLanguage: string;
  }) => {
    try {
      const result = await dispatch(registerUser(userData));
      if (registerUser.fulfilled.match(result)) {
        // Store user data for persistence
        localStorage.setItem('userData', JSON.stringify(result.payload.user));
        navigate('/learn');
        return { success: true };
      } else {
        return { success: false, error: result.payload as string };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }, [dispatch, navigate]);

  const logout = useCallback(() => {
    dispatch(logoutUser());
    localStorage.removeItem('userData');
    navigate('/');
  }, [dispatch, navigate]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearAuthError,
  };
};