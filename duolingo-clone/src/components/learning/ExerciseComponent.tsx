import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useNotification } from '../../hooks/useNotification';
import { submitAnswer, nextExercise, completeLesson } from '../../store/slices/learningSlice';
import { addXP, loseHeart } from '../../store/slices/userSlice';
import { APIService } from '../../services/api';

const ExerciseContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 400px;
`;

const ProgressBar = styled.div`
  background: ${props => props.theme.colors.border};
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 2rem;
`;

const ProgressFill = styled.div<{ progress: number }>`
  background: ${props => props.theme.colors.primary};
  height: 100%;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const QuestionArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  margin-bottom: 2rem;
`;

const QuestionText = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 2rem;
  line-height: 1.4;
`;

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const OptionButton = styled.button<{ selected?: boolean; correct?: boolean; incorrect?: boolean }>`
  padding: 1rem;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
  background: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.hover};
  }

  ${props => props.selected && `
    border-color: ${props.theme.colors.primary};
    background: ${props.theme.colors.primary};
    color: white;
  `}

  ${props => props.correct && `
    border-color: ${props.theme.colors.success};
    background: ${props.theme.colors.success};
    color: white;
  `}

  ${props => props.incorrect && `
    border-color: ${props.theme.colors.error};
    background: ${props.theme.colors.error};
    color: white;
  `}
`;

const InputField = styled.input`
  padding: 1rem;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const FeedbackArea = styled.div<{ show: boolean }>`
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const FeedbackText = styled.div<{ correct: boolean }>`
  padding: 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-align: center;
  background: ${props => props.correct ? props.theme.colors.success : props.theme.colors.error};
  color: white;
`;

const ActionButton = styled.button<{ disabled?: boolean }>`
  padding: 1rem 2rem;
  background: ${props => props.disabled ? props.theme.colors.disabled : props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
  }
`;

const CompletionScreen = styled.div`
  text-align: center;
  padding: 2rem;
`;

const CompletionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: ${props => props.theme.colors.success};
  margin-bottom: 1rem;
`;

const CompletionStats = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 2rem 0;
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
`;

interface ExerciseComponentProps {
  exercises: any[];
  sessionId: string;
  onComplete: () => void;
}

const ExerciseComponent: React.FC<ExerciseComponentProps> = ({
  exercises,
  sessionId,
  onComplete,
}) => {
  const dispatch = useAppDispatch();
  const { showError } = useNotification();
  const { currentSession } = useAppSelector(state => state.learning);
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0, xp: 0 });

  const currentExercise = exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer.trim()) return;

    try {
      const response = await APIService.submitAnswer(
        currentExercise.id,
        selectedAnswer,
        5000 // Mock time spent
      );

      if (response.success) {
        const result = response.data;
        setIsCorrect(result.correct);
        setFeedbackText(result.explanation);
        setShowFeedback(true);

        // Update Redux state
        dispatch(submitAnswer({
          exerciseId: currentExercise.id,
          userAnswer: selectedAnswer,
          isCorrect: result.correct,
          timeSpent: 5000,
          xpEarned: result.xpEarned,
          heartsLost: result.heartsLost,
        }));

        // Update user stats
        if (result.correct) {
          dispatch(addXP(result.xpEarned));
          setStats(prev => ({ 
            ...prev, 
            correct: prev.correct + 1, 
            total: prev.total + 1,
            xp: prev.xp + result.xpEarned 
          }));
        } else {
          dispatch(loseHeart());
          setStats(prev => ({ ...prev, total: prev.total + 1 }));
        }

        // Auto-advance after 2 seconds
        setTimeout(() => {
          handleNextExercise();
        }, 2000);
      }
    } catch (error) {
      showError('Error', 'Failed to submit answer. Please try again.');
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
      dispatch(nextExercise());
    } else {
      // Lesson completed
      handleLessonComplete();
    }
  };

  const handleLessonComplete = async () => {
    try {
      const response = await APIService.completeLesson(exercises[0].id.split('-')[0], {
        sessionId,
        exercisesCompleted: exercises.length,
        exercisesCorrect: stats.correct,
        timeSpent: exercises.length * 5000,
      });

      if (response.success) {
        dispatch(completeLesson());
        setIsCompleted(true);
      }
    } catch (error) {
      showError('Error', 'Failed to complete lesson. Please try again.');
    }
  };

  if (isCompleted) {
    return (
      <CompletionScreen>
        <CompletionTitle>🎉 Lesson Complete!</CompletionTitle>
        
        <CompletionStats>
          <StatItem>
            <StatValue>{stats.correct}/{stats.total}</StatValue>
            <StatLabel>Correct</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>+{stats.xp}</StatValue>
            <StatLabel>XP Earned</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{Math.round((stats.correct / stats.total) * 100)}%</StatValue>
            <StatLabel>Accuracy</StatLabel>
          </StatItem>
        </CompletionStats>

        <ActionButton onClick={onComplete}>
          Continue
        </ActionButton>
      </CompletionScreen>
    );
  }

  if (!currentExercise) {
    return <div>Loading exercise...</div>;
  }

  return (
    <ExerciseContainer>
      <ProgressBar>
        <ProgressFill progress={progress} />
      </ProgressBar>

      <QuestionArea>
        <QuestionText>{currentExercise.question}</QuestionText>

        {currentExercise.type === 'multiple_choice' && (
          <OptionsContainer>
            {currentExercise.options.map((option: string, index: number) => (
              <OptionButton
                key={index}
                selected={selectedAnswer === option && !showFeedback}
                correct={showFeedback && option === currentExercise.correctAnswer}
                incorrect={showFeedback && selectedAnswer === option && !isCorrect}
                onClick={() => !showFeedback && handleAnswerSelect(option)}
              >
                {option}
              </OptionButton>
            ))}
          </OptionsContainer>
        )}

        {(currentExercise.type === 'translation' || currentExercise.type === 'fill_blank') && (
          <InputField
            type="text"
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            placeholder="Type your answer..."
            disabled={showFeedback}
          />
        )}
      </QuestionArea>

      <FeedbackArea show={showFeedback}>
        {showFeedback && (
          <FeedbackText correct={isCorrect}>
            {feedbackText}
          </FeedbackText>
        )}
      </FeedbackArea>

      {!showFeedback && (
        <ActionButton
          disabled={!selectedAnswer.trim()}
          onClick={handleSubmitAnswer}
        >
          Check Answer
        </ActionButton>
      )}
    </ExerciseContainer>
  );
};

export default ExerciseComponent;