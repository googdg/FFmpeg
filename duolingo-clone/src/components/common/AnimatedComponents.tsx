import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// 动画关键帧
const slideInFromRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInFromLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInFromTop = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideInFromBottom = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const bounceIn = keyframes`
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// 动画容器组件
const AnimatedContainer = styled.div<{
  animation: string;
  duration?: string;
  delay?: string;
  easing?: string;
}>`
  animation: ${props => {
    const animationMap: Record<string, any> = {
      slideInFromRight,
      slideInFromLeft,
      slideInFromTop,
      slideInFromBottom,
      fadeIn,
      scaleIn,
      bounceIn,
      shake,
      pulse,
    };
    return animationMap[props.animation] || fadeIn;
  }} ${props => props.duration || '0.3s'} ${props => props.easing || 'ease-out'} ${props => props.delay || '0s'} both;
`;

// 悬停效果组件
const HoverContainer = styled.div<{
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'rotate';
  disabled?: boolean;
}>`
  transition: all 0.2s ease;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  
  ${props => !props.disabled && css`
    &:hover {
      ${props.hoverEffect === 'lift' && css`
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      `}
      
      ${props.hoverEffect === 'scale' && css`
        transform: scale(1.05);
      `}
      
      ${props.hoverEffect === 'glow' && css`
        box-shadow: 0 0 20px rgba(28, 176, 246, 0.4);
      `}
      
      ${props.hoverEffect === 'rotate' && css`
        transform: rotate(5deg);
      `}
    }
  `}
`;

// 点击反馈组件
const ClickableContainer = styled.div<{ clickEffect?: 'ripple' | 'scale' | 'bounce' }>`
  position: relative;
  overflow: hidden;
  transition: transform 0.1s ease;
  
  &:active {
    ${props => props.clickEffect === 'scale' && css`
      transform: scale(0.95);
    `}
    
    ${props => props.clickEffect === 'bounce' && css`
      animation: ${pulse} 0.3s ease;
    `}
  }
`;

// Framer Motion 预设动画
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3 }
};

export const slideInRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
  transition: { duration: 0.3 }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
  transition: { duration: 0.3 }
};

export const scaleInOut = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.2 }
};

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// 组件接口
interface AnimatedProps {
  children: React.ReactNode;
  animation?: string;
  duration?: string;
  delay?: string;
  easing?: string;
}

interface HoverProps {
  children: React.ReactNode;
  effect?: 'lift' | 'scale' | 'glow' | 'rotate';
  disabled?: boolean;
  onClick?: () => void;
}

interface ClickableProps {
  children: React.ReactNode;
  effect?: 'ripple' | 'scale' | 'bounce';
  onClick?: () => void;
}

interface FadeTransitionProps {
  show: boolean;
  children: React.ReactNode;
  duration?: number;
}

interface SlideTransitionProps {
  show: boolean;
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
}

// 导出的动画组件
export const Animated: React.FC<AnimatedProps> = ({
  children,
  animation = 'fadeIn',
  duration,
  delay,
  easing
}) => (
  <AnimatedContainer
    animation={animation}
    duration={duration}
    delay={delay}
    easing={easing}
  >
    {children}
  </AnimatedContainer>
);

export const Hoverable: React.FC<HoverProps> = ({
  children,
  effect = 'lift',
  disabled = false,
  onClick
}) => (
  <HoverContainer
    hoverEffect={effect}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </HoverContainer>
);

export const Clickable: React.FC<ClickableProps> = ({
  children,
  effect = 'scale',
  onClick
}) => (
  <ClickableContainer clickEffect={effect} onClick={onClick}>
    {children}
  </ClickableContainer>
);

export const FadeTransition: React.FC<FadeTransitionProps> = ({
  show,
  children,
  duration = 0.3
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

export const SlideTransition: React.FC<SlideTransitionProps> = ({
  show,
  children,
  direction = 'up',
  duration = 0.3
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 20 };
      case 'down': return { y: -20 };
      case 'left': return { x: 20 };
      case 'right': return { x: -20 };
      default: return { y: 20 };
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, ...getInitialPosition() }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, ...getInitialPosition() }}
          transition={{ duration }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 列表动画组件
export const AnimatedList: React.FC<{
  children: React.ReactNode[];
  stagger?: number;
}> = ({ children, stagger = 0.1 }) => (
  <motion.div
    initial="initial"
    animate="animate"
    variants={staggerChildren}
  >
    {children.map((child, index) => (
      <motion.div
        key={index}
        variants={fadeInUp}
        transition={{ delay: index * stagger }}
      >
        {child}
      </motion.div>
    ))}
  </motion.div>
);

// 页面过渡组件
export const PageTransition: React.FC<{
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
}> = ({ children, direction = 'horizontal' }) => (
  <motion.div
    initial={{ 
      opacity: 0, 
      x: direction === 'horizontal' ? 100 : 0,
      y: direction === 'vertical' ? 100 : 0
    }}
    animate={{ opacity: 1, x: 0, y: 0 }}
    exit={{ 
      opacity: 0, 
      x: direction === 'horizontal' ? -100 : 0,
      y: direction === 'vertical' ? -100 : 0
    }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

// 模态框动画组件
export const ModalTransition: React.FC<{
  show: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}> = ({ show, children, onClose }) => (
  <AnimatePresence>
    {show && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          }}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1001,
          }}
        >
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// 成功/错误反馈动画
export const FeedbackAnimation: React.FC<{
  type: 'success' | 'error' | 'warning';
  show: boolean;
  children: React.ReactNode;
}> = ({ type, show, children }) => {
  const getAnimation = () => {
    switch (type) {
      case 'success':
        return {
          initial: { scale: 0, rotate: -180 },
          animate: { scale: 1, rotate: 0 },
          transition: { type: 'spring', stiffness: 200, damping: 10 }
        };
      case 'error':
        return {
          initial: { x: -10 },
          animate: { x: [0, -10, 10, -10, 10, 0] },
          transition: { duration: 0.5 }
        };
      case 'warning':
        return {
          initial: { y: -10, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.3 }
        };
      default:
        return {};
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div {...getAnimation()}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Animated;