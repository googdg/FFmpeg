import React from 'react';
import styled, { keyframes } from 'styled-components';

// 动画定义
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const wave = keyframes`
  0%, 60%, 100% { transform: initial; }
  30% { transform: translateY(-15px); }
`;

// 基础加载容器
const LoadingContainer = styled.div<{ fullScreen?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => props.fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: 9999;
  `}
  padding: 20px;
`;

// 旋转加载器
const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const Spinner = styled.div<{ size?: number; color?: string }>`
  width: ${props => props.size || 40}px;
  height: ${props => props.size || 40}px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid ${props => props.color || '#1cb0f6'};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  color: #666;
  font-size: 14px;
  font-weight: 500;
`;

// 点状加载器
const DotsContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const Dot = styled.div<{ delay: number; color?: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color || '#1cb0f6'};
  animation: ${bounce} 1.4s ease-in-out ${props => props.delay}s infinite both;
`;

// 波浪加载器
const WaveContainer = styled.div`
  display: flex;
  gap: 2px;
  align-items: center;
`;

const WaveBar = styled.div<{ delay: number; color?: string }>`
  width: 4px;
  height: 20px;
  background: ${props => props.color || '#1cb0f6'};
  border-radius: 2px;
  animation: ${wave} 1.2s ease-in-out ${props => props.delay}s infinite;
`;

// 骨架屏组件
const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
`;

const SkeletonItem = styled.div<{ 
  width?: string; 
  height?: string; 
  borderRadius?: string 
}>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '16px'};
  border-radius: ${props => props.borderRadius || '4px'};
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const SkeletonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

// 进度条
const ProgressContainer = styled.div`
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number; color?: string }>`
  height: 100%;
  width: ${props => props.progress}%;
  background: ${props => props.color || '#1cb0f6'};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 12px;
  color: #666;
`;

// 加载组件接口
interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

interface LoadingDotsProps {
  color?: string;
  text?: string;
}

interface LoadingWaveProps {
  color?: string;
  text?: string;
}

interface SkeletonProps {
  lines?: number;
  avatar?: boolean;
  card?: boolean;
}

interface ProgressProps {
  progress: number;
  text?: string;
  color?: string;
}

// 导出的加载组件
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size,
  color,
  text,
  fullScreen
}) => (
  <LoadingContainer fullScreen={fullScreen}>
    <SpinnerContainer>
      <Spinner size={size} color={color} />
      {text && <LoadingText>{text}</LoadingText>}
    </SpinnerContainer>
  </LoadingContainer>
);

export const LoadingDots: React.FC<LoadingDotsProps> = ({ color, text }) => (
  <LoadingContainer>
    <SpinnerContainer>
      <DotsContainer>
        <Dot delay={0} color={color} />
        <Dot delay={0.2} color={color} />
        <Dot delay={0.4} color={color} />
      </DotsContainer>
      {text && <LoadingText>{text}</LoadingText>}
    </SpinnerContainer>
  </LoadingContainer>
);

export const LoadingWave: React.FC<LoadingWaveProps> = ({ color, text }) => (
  <LoadingContainer>
    <SpinnerContainer>
      <WaveContainer>
        {Array.from({ length: 5 }, (_, i) => (
          <WaveBar key={i} delay={i * 0.1} color={color} />
        ))}
      </WaveContainer>
      {text && <LoadingText>{text}</LoadingText>}
    </SpinnerContainer>
  </LoadingContainer>
);

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  lines = 3,
  avatar = false,
  card = false
}) => {
  if (card) {
    return (
      <SkeletonContainer>
        <SkeletonItem height="200px" borderRadius="8px" />
        <SkeletonItem height="20px" width="80%" />
        <SkeletonItem height="16px" width="60%" />
      </SkeletonContainer>
    );
  }

  return (
    <SkeletonContainer>
      {avatar && (
        <SkeletonRow>
          <SkeletonItem width="40px" height="40px" borderRadius="50%" />
          <div style={{ flex: 1 }}>
            <SkeletonItem height="16px" width="60%" />
            <SkeletonItem height="12px" width="40%" />
          </div>
        </SkeletonRow>
      )}
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonItem
          key={i}
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </SkeletonContainer>
  );
};

export const ProgressLoader: React.FC<ProgressProps> = ({
  progress,
  text,
  color
}) => (
  <LoadingContainer>
    <ProgressContainer>
      <ProgressBar>
        <ProgressFill progress={progress} color={color} />
      </ProgressBar>
      <ProgressText>
        {text || `${Math.round(progress)}%`}
      </ProgressText>
    </ProgressContainer>
  </LoadingContainer>
);

// 智能加载组件 - 根据加载时间自动切换样式
export const SmartLoader: React.FC<{
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
}> = ({ isLoading, text, children }) => {
  const [loadingTime, setLoadingTime] = React.useState(0);

  React.useEffect(() => {
    if (!isLoading) {
      setLoadingTime(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      setLoadingTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) {
    return <>{children}</>;
  }

  // 根据加载时间选择不同的加载样式
  if (loadingTime < 500) {
    // 短时间加载 - 简单的点状加载
    return <LoadingDots text={text} />;
  } else if (loadingTime < 2000) {
    // 中等时间加载 - 旋转加载器
    return <LoadingSpinner text={text} />;
  } else {
    // 长时间加载 - 骨架屏
    return <SkeletonLoader lines={3} />;
  }
};

export default LoadingSpinner;