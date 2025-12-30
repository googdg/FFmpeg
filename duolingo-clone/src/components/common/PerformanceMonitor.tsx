import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useMemoryMonitor, useNetworkStatus } from '../../hooks/usePerformance';
import { performanceTracker } from '../../utils/performance';

const MonitorContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  z-index: 10000;
  min-width: 250px;
  transform: translateX(${props => props.isVisible ? '0' : '100%'});
  transition: transform 0.3s ease;
  backdrop-filter: blur(10px);
`;

const ToggleButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  background: #1cb0f6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 10001;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #0ea5e9;
    transform: scale(1.1);
  }
`;

const Section = styled.div`
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
  color: #1cb0f6;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
`;

const MetricLabel = styled.span`
  color: #ccc;
`;

const MetricValue = styled.span<{ warning?: boolean; error?: boolean }>`
  color: ${props => {
    if (props.error) return '#ff4444';
    if (props.warning) return '#ffaa00';
    return '#00ff88';
  }};
  font-weight: bold;
`;

const StatusIndicator = styled.div<{ status: 'online' | 'offline' | 'slow' }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  background: ${props => {
    switch (props.status) {
      case 'online': return '#00ff88';
      case 'offline': return '#ff4444';
      case 'slow': return '#ffaa00';
      default: return '#ccc';
    }
  }};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: white;
  }
`;

interface PerformanceMonitorProps {
  enabled?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [fps, setFps] = useState(0);
  const [renderTime, setRenderTime] = useState(0);
  const memoryUsage = useMemoryMonitor(2000);
  const { isOnline, connectionType } = useNetworkStatus();

  // FPS 监控
  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [enabled]);

  // 渲染时间监控
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const measures = performanceTracker.getAllMeasures();
      const renderMeasures = Object.entries(measures)
        .filter(([key]) => key.includes('render'))
        .map(([, value]) => value);
      
      if (renderMeasures.length > 0) {
        const avgRenderTime = renderMeasures.reduce((sum, time) => sum + time, 0) / renderMeasures.length;
        setRenderTime(avgRenderTime);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getNetworkStatus = (): 'online' | 'offline' | 'slow' => {
    if (!isOnline) return 'offline';
    if (connectionType === 'slow-2g' || connectionType === '2g') return 'slow';
    return 'online';
  };

  return (
    <>
      {!isVisible && (
        <ToggleButton onClick={() => setIsVisible(true)}>
          📊
        </ToggleButton>
      )}
      
      <MonitorContainer isVisible={isVisible}>
        <CloseButton onClick={() => setIsVisible(false)}>
          ×
        </CloseButton>
        
        <Section>
          <SectionTitle>性能监控</SectionTitle>
          <MetricRow>
            <MetricLabel>FPS:</MetricLabel>
            <MetricValue warning={fps < 30} error={fps < 15}>
              {fps}
            </MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>渲染时间:</MetricLabel>
            <MetricValue warning={renderTime > 16} error={renderTime > 33}>
              {renderTime.toFixed(2)}ms
            </MetricValue>
          </MetricRow>
        </Section>

        {memoryUsage && (
          <Section>
            <SectionTitle>内存使用</SectionTitle>
            <MetricRow>
              <MetricLabel>已使用:</MetricLabel>
              <MetricValue>
                {formatBytes(memoryUsage.used)}
              </MetricValue>
            </MetricRow>
            <MetricRow>
              <MetricLabel>总计:</MetricLabel>
              <MetricValue>
                {formatBytes(memoryUsage.total)}
              </MetricValue>
            </MetricRow>
            <MetricRow>
              <MetricLabel>使用率:</MetricLabel>
              <MetricValue 
                warning={memoryUsage.percentage > 70} 
                error={memoryUsage.percentage > 90}
              >
                {memoryUsage.percentage.toFixed(1)}%
              </MetricValue>
            </MetricRow>
          </Section>
        )}

        <Section>
          <SectionTitle>网络状态</SectionTitle>
          <MetricRow>
            <MetricLabel>
              <StatusIndicator status={getNetworkStatus()} />
              连接:
            </MetricLabel>
            <MetricValue>
              {isOnline ? '在线' : '离线'}
            </MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>类型:</MetricLabel>
            <MetricValue>
              {connectionType}
            </MetricValue>
          </MetricRow>
        </Section>

        <Section>
          <SectionTitle>操作</SectionTitle>
          <button
            onClick={() => {
              performanceTracker.clear();
              console.log('Performance data cleared');
            }}
            style={{
              background: '#333',
              color: 'white',
              border: '1px solid #555',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              marginRight: '8px',
            }}
          >
            清除数据
          </button>
          <button
            onClick={() => {
              const measures = performanceTracker.getAllMeasures();
              console.table(measures);
            }}
            style={{
              background: '#333',
              color: 'white',
              border: '1px solid #555',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            导出数据
          </button>
        </Section>
      </MonitorContainer>
    </>
  );
};

export default PerformanceMonitor;