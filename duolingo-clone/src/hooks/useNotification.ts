import { useCallback } from 'react';
import { useAppDispatch } from './redux';
import { addNotification, removeNotification, hideNotification } from '../store/slices/uiSlice';

export const useNotification = () => {
  const dispatch = useAppDispatch();

  const showNotification = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    duration?: number
  ) => {
    const action = dispatch(addNotification({ type, title, message, duration }));
    const id = action.payload.id;
    
    // Auto-hide notification after duration
    const hideAfter = duration || 2000; // 改为2秒
    setTimeout(() => {
      dispatch(hideNotification(id));
      // Remove from store after fade out animation
      setTimeout(() => {
        dispatch(removeNotification(id));
      }, 300);
    }, hideAfter);

    return id;
  }, [dispatch]);

  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    return showNotification('success', title, message, duration);
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    return showNotification('error', title, message, duration);
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    return showNotification('warning', title, message, duration);
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    return showNotification('info', title, message, duration);
  }, [showNotification]);

  const hideNotificationById = useCallback((id: string) => {
    dispatch(hideNotification(id));
    setTimeout(() => {
      dispatch(removeNotification(id));
    }, 300);
  }, [dispatch]);

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification: hideNotificationById,
  };
};