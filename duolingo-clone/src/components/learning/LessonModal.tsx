import React, { useState } from 'react';
import styled from 'styled-components';
import { useNotification } from '../../hooks/useNotification';
import LoadingSpinner from '../common/LoadingSpinner';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.modal};
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${props => props.theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.theme.colors.textLight};
  padding: 0.5rem;
  border-radius: 50%;
  
  &:hover {
    background: ${props => props.theme.colors.hover};
  }
`;

const ModalBody = styled.div`
  padding: 2rem;
`;

const LessonIntro = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LessonDescription = styled.p`
  color: ${props => props.theme.colors.textLight};
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const StartButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 0 ${props => props.theme.colors.primaryDark};
  width: 100%;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 6px 0 ${props => props.theme.colors.primaryDark};
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 0 ${props => props.theme.colors.primaryDark};
  }
`;

const LessonStats = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
  padding: 1rem;
  background: ${props => props.theme.colors.backgroundGray};
  border-radius: 0.5rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${props => props.theme.colors.primary};
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textLight};
  margin-top: 0.25rem;
`;

interface LessonModalProps {
  lessonId: string;
  onClose: () => void;
}

const LessonModal: React.FC<LessonModalProps> = ({ lessonId, onClose }) => {
  const { showSuccess } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [score, setScore] = useState(0);

  // 模拟练习数据
  const mockExercises = [
    {
      id: 'ex-1',
      type: 'multiple_choice',
      question: '如何用英语说"你好"？',
      options: ['Hello', 'Goodbye', 'Thank you', 'Please'],
      correctAnswer: 'Hello',
    },
    {
      id: 'ex-2',
      type: 'multiple_choice',
      question: '如何用英语说"再见"？',
      options: ['Hello', 'Goodbye', 'Thank you', 'Please'],
      correctAnswer: 'Goodbye',
    },
    {
      id: 'ex-3',
      type: 'multiple_choice',
      question: '如何用英语说"谢谢"？',
      options: ['Hello', 'Goodbye', 'Thank you', 'Please'],
      correctAnswer: 'Thank you',
    },
  ];

  const handleStartLesson = () => {
    setLoading(true);
    // 模拟加载时间
    setTimeout(() => {
      setLoading(false);
      setLessonStarted(true);
      showSuccess('课程开始', '祝你学习愉快！');
    }, 1000);
  };

  const handleAnswerSelect = (answer: string) => {
    const isCorrect = answer === mockExercises[currentExercise].correctAnswer;
    if (isCorrect) {
      setScore(score + 10);
      showSuccess('正确！', '答对了！');
    } else {
      showSuccess('继续努力', '再试试看！');
    }

    // 延迟进入下一题
    setTimeout(() => {
      if (currentExercise < mockExercises.length - 1) {
        setCurrentExercise(currentExercise + 1);
      } else {
        handleLessonComplete();
      }
    }, 1500);
  };

  const handleLessonComplete = () => {
    showSuccess('课程完成！', `恭喜！你获得了 ${score} 经验值！`);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (lessonStarted) {
    const exercise = mockExercises[currentExercise];
    const progress = ((currentExercise + 1) / mockExercises.length) * 100;

    return (
      <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>课程进行中 ({currentExercise + 1}/{mockExercises.length})</ModalTitle>
            <CloseButton onClick={onClose}>×</CloseButton>
          </ModalHeader>
          <ModalBody>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ 
                background: '#e0e0e0', 
                height: '8px', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  background: '#58cc02', 
                  height: '100%', 
                  width: `${progress}%`,
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
                {exercise.question}
              </h3>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                {exercise.options.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    style={{
                      padding: '1rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '0.5rem',
                      background: 'white',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#58cc02';
                      e.currentTarget.style.background = '#f0f8ff';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.background = 'white';
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>开始课程</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ModalBody>
          {loading ? (
            <LoadingSpinner text="正在启动课程..." />
          ) : (
            <LessonIntro>
              <LessonDescription>
                🎯 准备学习英语问候语吗？这节课将教你如何用英语打招呼、告别和自我介绍！
              </LessonDescription>
              
              <LessonStats>
                <StatItem>
                  <StatValue>3</StatValue>
                  <StatLabel>练习题</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>+30</StatValue>
                  <StatLabel>经验值</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>~3</StatValue>
                  <StatLabel>分钟</StatLabel>
                </StatItem>
              </LessonStats>
              
              <StartButton onClick={handleStartLesson}>
                开始课程
              </StartButton>
            </LessonIntro>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default LessonModal;