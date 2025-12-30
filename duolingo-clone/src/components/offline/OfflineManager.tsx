import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { offlineService } from '../../services/offlineService';
import { useAppSelector } from '../../store/hooks';

const Container = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
`;

const CourseItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const CourseInfo = styled.div`
  flex: 1;
`;

const CourseName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const CourseStatus = styled.div<{ status: 'downloaded' | 'downloading' | 'available' }>`
  font-size: 14px;
  color: ${props => {
    switch (props.status) {
      case 'downloaded': return '#28a745';
      case 'downloading': return '#ffc107';
      case 'available': return '#6c757d';
      default: return '#6c757d';
    }
  }};
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' | 'secondary' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #1cb0f6;
          color: white;
          &:hover { background: #0ea5e9; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      case 'secondary':
      default:
        return `
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #dee2e6;
          &:hover { background: #e9ecef; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: #1cb0f6;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const StorageInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const StorageItem = styled.div`
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const StorageValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #1cb0f6;
  margin-bottom: 4px;
`;

const StorageLabel = styled.div`
  font-size: 14px;
  color: #6c757d;
`;

const OfflineIndicator = styled.div<{ isOnline: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  background: ${props => props.isOnline ? '#d4edda' : '#f8d7da'};
  color: ${props => props.isOnline ? '#155724' : '#721c24'};
  margin-bottom: 20px;
`;

const StatusDot = styled.div<{ isOnline: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.isOnline ? '#28a745' : '#dc3545'};
`;

interface DownloadProgress {
  courseId: string;
  progress: number;
  downloadedCount: number;
  totalCount: number;
  currentLesson: string;
}

export const OfflineManager: React.FC = () => {
  const [downloadedCourses, setDownloadedCourses] = useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, DownloadProgress>>({});
  const [storageUsage, setStorageUsage] = useState({
    totalSize: 0,
    contentCount: 0,
    progressCount: 0
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);

  const availableCourses = useAppSelector(state => state.learning.courses);

  useEffect(() => {
    loadOfflineData();
    setupEventListeners();

    return () => {
      removeEventListeners();
    };
  }, []);

  const loadOfflineData = async () => {
    try {
      const [downloaded, usage, pending] = await Promise.all([
        offlineService.getDownloadedCourses(),
        offlineService.getStorageUsage(),
        offlineService.getPendingProgress()
      ]);

      setDownloadedCourses(downloaded);
      setStorageUsage(usage);
      setPendingSync(pending.length);
    } catch (error) {
      console.error('加载离线数据失败:', error);
    }
  };

  const setupEventListeners = () => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    const handleDownloadProgress = (event: CustomEvent) => {
      const progress = event.detail as DownloadProgress;
      setDownloadProgress(prev => ({
        ...prev,
        [progress.courseId]: progress
      }));
    };

    const handleDownloadComplete = (event: CustomEvent) => {
      const { courseId } = event.detail;
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[courseId];
        return newProgress;
      });
      loadOfflineData(); // 重新加载数据
    };

    const handleSyncComplete = () => {
      loadOfflineData(); // 重新加载数据
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-download-progress', handleDownloadProgress as EventListener);
    window.addEventListener('offline-download-complete', handleDownloadComplete as EventListener);
    window.addEventListener('offline-sync-complete', handleSyncComplete);
  };

  const removeEventListeners = () => {
    window.removeEventListener('online', () => setIsOnline(true));
    window.removeEventListener('offline', () => setIsOnline(false));
    window.removeEventListener('offline-download-progress', () => {});
    window.removeEventListener('offline-download-complete', () => {});
    window.removeEventListener('offline-sync-complete', () => {});
  };

  const handleDownloadCourse = async (courseId: string) => {
    try {
      await offlineService.downloadCourse(courseId);
    } catch (error) {
      console.error('下载课程失败:', error);
      alert('下载失败，请检查网络连接后重试');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('确定要删除这个课程的离线内容吗？')) {
      try {
        await offlineService.deleteOfflineContent(courseId);
        await loadOfflineData();
      } catch (error) {
        console.error('删除离线内容失败:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const handleSyncProgress = async () => {
    if (!isOnline) {
      alert('需要网络连接才能同步进度');
      return;
    }

    try {
      await offlineService.syncOfflineProgress();
      alert('同步完成！');
    } catch (error) {
      console.error('同步失败:', error);
      alert('同步失败，请重试');
    }
  };

  const handleCleanupExpired = async () => {
    if (confirm('确定要清理过期的离线内容吗？（超过30天的内容将被删除）')) {
      try {
        await offlineService.cleanupExpiredContent();
        await loadOfflineData();
        alert('清理完成！');
      } catch (error) {
        console.error('清理失败:', error);
        alert('清理失败，请重试');
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCourseStatus = (courseId: string): 'downloaded' | 'downloading' | 'available' => {
    if (downloadProgress[courseId]) return 'downloading';
    if (downloadedCourses.includes(courseId)) return 'downloaded';
    return 'available';
  };

  const getStatusText = (status: string, courseId: string): string => {
    switch (status) {
      case 'downloaded':
        return '已下载';
      case 'downloading':
        const progress = downloadProgress[courseId];
        return `下载中... ${Math.round(progress?.progress || 0)}%`;
      case 'available':
        return '可下载';
      default:
        return '未知状态';
    }
  };

  return (
    <Container>
      <OfflineIndicator isOnline={isOnline}>
        <StatusDot isOnline={isOnline} />
        {isOnline ? '在线模式' : '离线模式'}
        {!isOnline && ' - 你可以继续学习已下载的课程'}
      </OfflineIndicator>

      <Section>
        <SectionTitle>课程下载管理</SectionTitle>
        {availableCourses.map(course => {
          const status = getCourseStatus(course.id);
          const progress = downloadProgress[course.id];
          
          return (
            <CourseItem key={course.id}>
              <CourseInfo>
                <CourseName>{course.name}</CourseName>
                <CourseStatus status={status}>
                  {getStatusText(status, course.id)}
                </CourseStatus>
                {progress && (
                  <>
                    <ProgressBar>
                      <ProgressFill progress={progress.progress} />
                    </ProgressBar>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      {progress.currentLesson} ({progress.downloadedCount}/{progress.totalCount})
                    </div>
                  </>
                )}
              </CourseInfo>
              
              {status === 'available' && (
                <ActionButton
                  variant="primary"
                  onClick={() => handleDownloadCourse(course.id)}
                  disabled={!isOnline}
                >
                  下载
                </ActionButton>
              )}
              
              {status === 'downloading' && (
                <ActionButton disabled>
                  下载中...
                </ActionButton>
              )}
              
              {status === 'downloaded' && (
                <ActionButton
                  variant="danger"
                  onClick={() => handleDeleteCourse(course.id)}
                >
                  删除
                </ActionButton>
              )}
            </CourseItem>
          );
        })}
      </Section>

      <Section>
        <SectionTitle>存储使用情况</SectionTitle>
        <StorageInfo>
          <StorageItem>
            <StorageValue>{formatFileSize(storageUsage.totalSize)}</StorageValue>
            <StorageLabel>总存储大小</StorageLabel>
          </StorageItem>
          <StorageItem>
            <StorageValue>{storageUsage.contentCount}</StorageValue>
            <StorageLabel>离线内容数</StorageLabel>
          </StorageItem>
          <StorageItem>
            <StorageValue>{pendingSync}</StorageValue>
            <StorageLabel>待同步进度</StorageLabel>
          </StorageItem>
        </StorageInfo>
        
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {pendingSync > 0 && (
            <ActionButton
              variant="primary"
              onClick={handleSyncProgress}
              disabled={!isOnline}
            >
              同步进度 ({pendingSync})
            </ActionButton>
          )}
          
          <ActionButton
            variant="secondary"
            onClick={handleCleanupExpired}
          >
            清理过期内容
          </ActionButton>
        </div>
      </Section>

      {!isOnline && (
        <Section>
          <SectionTitle>离线学习提示</SectionTitle>
          <div style={{ color: '#6c757d', lineHeight: '1.5' }}>
            <p>• 你现在处于离线状态，只能学习已下载的课程</p>
            <p>• 学习进度会保存在本地，联网后自动同步</p>
            <p>• 建议在WiFi环境下下载课程内容</p>
          </div>
        </Section>
      )}
    </Container>
  );
};

export default OfflineManager;