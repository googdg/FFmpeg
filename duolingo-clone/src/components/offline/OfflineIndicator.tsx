import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { offlineService } from '../../services/offlineService';

const slideDown = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
`;

const Container = styled.div<{ isVisible: boolean; isOnline: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: ${props => props.isOnline ? '#d4edda' : '#f8d7da'};
  color: ${props => props.isOnline ? '#155724' : '#721c24'};
  padding: 12px 20px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid ${props => props.isOnline ? '#c3e6cb' : '#f5c6cb'};
  animation: ${props => props.isVisible ? slideDown : slideUp} 0.3s ease-in-out;
  display: ${props => props.isVisible ? 'block' : 'none'};
`;

const StatusIcon = styled.span<{ isOnline: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.isOnline ? '#28a745' : '#dc3545'};
  margin-right: 8px;
`;

const SyncButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
  margin-left: 8px;
  
  &:hover {
    opacity: 0.8;
  }
`;

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isVisible, setIsVisible] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsVisible(true);
      checkPendingSync();
      
      // 3秒后隐藏在线提示
      setTimeout(() => {
        if (!showSyncSuccess) {
          setIsVisible(false);
        }
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsVisible(true);
    };

    const handleSyncComplete = (event: CustomEvent) => {
      const { syncedCount } = event.detail;
      if (syncedCount > 0) {
        setShowSyncSuccess(true);
        setPendingSync(0);
        
        // 显示同步成功消息3秒
        setTimeout(() => {
          setShowSyncSuccess(false);
          setIsVisible(false);
        }, 3000);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-sync-complete', handleSyncComplete as EventListener);

    // 初始检查
    if (!isOnline) {
      setIsVisible(true);
    }
    checkPendingSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-sync-complete', handleSyncComplete as EventListener);
    };
  }, [showSyncSuccess]);

  const checkPendingSync = async () => {
    try {
      const pending = await offlineService.getPendingProgress();
      setPendingSync(pending.length);
    } catch (error) {
      console.error('检查待同步进度失败:', error);
    }
  };

  const handleSyncNow = async () => {
    try {
      await offlineService.syncOfflineProgress();
    } catch (error) {
      console.error('同步失败:', error);
      alert('同步失败，请重试');
    }
  };

  const getMessage = (): string => {
    if (showSyncSuccess) {
      return `✅ 已同步 ${pendingSync} 个学习进度到云端`;
    }
    
    if (isOnline) {
      if (pendingSync > 0) {
        return `🌐 已连接网络，有 ${pendingSync} 个学习进度待同步`;
      }
      return '🌐 已连接网络';
    } else {
      return '📱 离线模式 - 你可以继续学习已下载的课程，进度会在联网后自动同步';
    }
  };

  if (!isVisible) return null;

  return (
    <Container isVisible={isVisible} isOnline={isOnline}>
      <StatusIcon isOnline={isOnline} />
      {getMessage()}
      {isOnline && pendingSync > 0 && !showSyncSuccess && (
        <SyncButton onClick={handleSyncNow}>
          立即同步
        </SyncButton>
      )}
    </Container>
  );
};

export default OfflineIndicator;