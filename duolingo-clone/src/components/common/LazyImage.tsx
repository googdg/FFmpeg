import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useImageLazyLoad } from '../../hooks/usePerformance';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const ImageContainer = styled.div<{ 
  width?: string | number; 
  height?: string | number;
  borderRadius?: string;
}>`
  position: relative;
  display: inline-block;
  overflow: hidden;
  width: ${props => typeof props.width === 'number' ? `${props.width}px` : props.width || 'auto'};
  height: ${props => typeof props.height === 'number' ? `${props.height}px` : props.height || 'auto'};
  border-radius: ${props => props.borderRadius || '0'};
  background-color: #f0f0f0;
`;

const Image = styled.img<{ isLoaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  
  ${props => props.isLoaded && css`
    animation: ${fadeIn} 0.3s ease-in-out;
  `}
`;

const Placeholder = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  opacity: ${props => props.isVisible ? 1 : 0};
  transition: opacity 0.3s ease;

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const ErrorContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #999;
  font-size: 14px;
`;

const ErrorIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
  opacity: 0.5;
`;

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  fallback?: React.ReactNode;
  threshold?: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  width,
  height,
  borderRadius,
  className,
  onLoad,
  onError,
  fallback,
  threshold = 0.1,
}) => {
  const { ref, src: imageSrc, isLoaded, error } = useImageLazyLoad(src, placeholder);

  useEffect(() => {
    if (isLoaded && onLoad) {
      onLoad();
    }
  }, [isLoaded, onLoad]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const renderContent = () => {
    if (error) {
      if (fallback) {
        return fallback;
      }
      return (
        <ErrorContainer>
          <ErrorIcon>🖼️</ErrorIcon>
          <div>图片加载失败</div>
        </ErrorContainer>
      );
    }

    return (
      <>
        <Image
          ref={ref}
          src={imageSrc}
          alt={alt}
          isLoaded={isLoaded}
          onLoad={() => {
            // 图片加载完成的额外处理
          }}
        />
        <Placeholder isVisible={!isLoaded && !error} />
      </>
    );
  };

  return (
    <ImageContainer
      width={width}
      height={height}
      borderRadius={borderRadius}
      className={className}
    >
      {renderContent()}
    </ImageContainer>
  );
};

// 预设的图片组件变体
export const AvatarImage: React.FC<Omit<LazyImageProps, 'borderRadius'> & { size?: number }> = ({
  size = 40,
  ...props
}) => (
  <LazyImage
    {...props}
    width={size}
    height={size}
    borderRadius="50%"
  />
);

export const CardImage: React.FC<LazyImageProps> = (props) => (
  <LazyImage
    {...props}
    borderRadius="8px"
  />
);

export const SkillIcon: React.FC<Omit<LazyImageProps, 'width' | 'height'>> = (props) => (
  <LazyImage
    {...props}
    width={64}
    height={64}
    borderRadius="12px"
  />
);

export default LazyImage;