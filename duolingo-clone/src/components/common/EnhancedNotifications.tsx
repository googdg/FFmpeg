import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// 动画定义
const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const progressAnimation = keyframes`
  from { width: 100%; }
  to { width: 0%; }
`;

// 通知容器
const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  
  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
`;

// 通知卡片
const NotificationCard = styled(motion.div)<{ type: NotificationType }>`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
`;

// 通知内容
const NotificationContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const NotificationIcon = styled.div<{ type: NotificationType }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
  background: ${props => {
    switch (props.type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
`;

const NotificationText = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 4px;
`;

const NotificationMessage = styled.div`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const NotificationButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  ${props => props.variant === 'primary' ? `
    background: #1cb0f6;
    color: white;
    &:hover { background: #0ea5e9; }
  ` : `
    background: #f3f4f6;
    color: #374151;
    &:hover { background: #e5e7eb; }
  `}
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 16px;
  line-height: 1;
  transition: color 0.2s ease;
  
  &:hover {
    color: #6b7280;
  }
`;

// 进度条
const ProgressBar = styled.div<{ duration: number; type: NotificationType }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: ${props => {
    switch (props.type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
  animation: ${progressAnimation} ${props => props.duration}ms linear;
`;

// 类型定义
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  actions?: NotificationAction[];
  persistent?: boolean;
  onClose?: () => void;
}

interface NotificationProps extends Notification {
  onRemove: (id: string) => void;
}

// 单个通知组件
const NotificationItem: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  actions,
  persistent = false,
  onClose,
  onRemove,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, persistent]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
    setTimeout(() => onRemove(id), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '•';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <NotificationCard
          type={type}
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          layout
        >
          <NotificationContent>
            <NotificationIcon type={type}>
              {getIcon()}
            </NotificationIcon>
            <NotificationText>
              <NotificationTitle>{title}</NotificationTitle>
              {message && (
                <NotificationMessage>{message}</NotificationMessage>
              )}
              {actions && actions.length > 0 && (
                <NotificationActions>
                  {actions.map((action, index) => (
                    <NotificationButton
                      key={index}
                      variant={action.variant}
                      onClick={action.onClick}
                    >
                      {action.label}
                    </NotificationButton>
                  ))}
                </NotificationActions>
              )}
            </NotificationText>
          </NotificationContent>
          
          <CloseButton onClick={handleClose}>
            ×
          </CloseButton>
          
          {!persistent && duration > 0 && (
            <ProgressBar duration={duration} type={type} />
          )}
        </NotificationCard>
      )}
    </AnimatePresence>
  );
};

// 通知管理器
class NotificationManager {
  private notifications: Notification[] = [];
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  show(notification: Omit<Notification, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = { ...notification, id };
    
    this.notifications.push(newNotification);
    this.notify();
    
    return id;
  }

  remove(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }

  clear() {
    this.notifications = [];
    this.notify();
  }

  // 便捷方法
  success(title: string, message?: string, options?: Partial<Notification>) {
    return this.show({ type: 'success', title, message, ...options });
  }

  error(title: string, message?: string, options?: Partial<Notification>) {
    return this.show({ type: 'error', title, message, ...options });
  }

  warning(title: string, message?: string, options?: Partial<Notification>) {
    return this.show({ type: 'warning', title, message, ...options });
  }

  info(title: string, message?: string, options?: Partial<Notification>) {
    return this.show({ type: 'info', title, message, ...options });
  }
}

// 全局通知管理器实例
export const notificationManager = new NotificationManager();

// 通知容器组件
export const EnhancedNotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    return notificationManager.subscribe(setNotifications);
  }, []);

  return (
    <NotificationContainer>
      <AnimatePresence>
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            {...notification}
            onRemove={notificationManager.remove.bind(notificationManager)}
          />
        ))}
      </AnimatePresence>
    </NotificationContainer>
  );
};

// React Hook
export const useNotifications = () => {
  return {
    show: notificationManager.show.bind(notificationManager),
    success: notificationManager.success.bind(notificationManager),
    error: notificationManager.error.bind(notificationManager),
    warning: notificationManager.warning.bind(notificationManager),
    info: notificationManager.info.bind(notificationManager),
    remove: notificationManager.remove.bind(notificationManager),
    clear: notificationManager.clear.bind(notificationManager),
  };
};

// 预设通知模板
export const NotificationTemplates = {
  // 学习相关
  lessonCompleted: (xp: number) => ({
    type: 'success' as const,
    title: '课程完成！',
    message: `恭喜你完成了这节课程，获得了 ${xp} XP！`,
    duration: 4000,
  }),

  streakMaintained: (days: number) => ({
    type: 'success' as const,
    title: '连击保持！',
    message: `太棒了！你已经连续学习 ${days} 天了！`,
    duration: 3000,
  }),

  heartLost: () => ({
    type: 'error' as const,
    title: '答错了',
    message: '别灰心，继续努力！',
    duration: 2000,
  }),

  // 系统相关
  offlineMode: () => ({
    type: 'warning' as const,
    title: '离线模式',
    message: '你现在处于离线状态，学习进度会在联网后同步。',
    persistent: true,
  }),

  syncComplete: (count: number) => ({
    type: 'success' as const,
    title: '同步完成',
    message: `已成功同步 ${count} 个学习记录到云端。`,
    duration: 3000,
  }),

  // 成就相关
  newAchievement: (achievement: string) => ({
    type: 'success' as const,
    title: '新成就解锁！',
    message: `恭喜获得成就：${achievement}`,
    duration: 5000,
  }),

  // 错误处理
  networkError: () => ({
    type: 'error' as const,
    title: '网络错误',
    message: '请检查网络连接后重试。',
    actions: [
      {
        label: '重试',
        onClick: () => window.location.reload(),
        variant: 'primary' as const,
      },
    ],
    persistent: true,
  }),

  // 更新提醒
  updateAvailable: () => ({
    type: 'info' as const,
    title: '有新版本可用',
    message: '发现新版本，是否立即更新？',
    actions: [
      {
        label: '更新',
        onClick: () => window.location.reload(),
        variant: 'primary' as const,
      },
      {
        label: '稍后',
        onClick: () => {},
        variant: 'secondary' as const,
      },
    ],
    persistent: true,
  }),
};

export default EnhancedNotificationContainer;