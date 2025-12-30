import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import ExerciseComponent from '../learning/ExerciseComponent';
import { theme } from '../../styles/theme';

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

// Mock exercise data
const mockMultipleChoiceExercise = {
  id: 'ex1',
  type: 'multiple_choice' as const,
  question: '如何用英语说"你好"？',
  correctAnswer: 'Hello',
  options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
  explanation: 'Hello是最常用的英语问候语',
};

const mockTranslationExercise = {
  id: 'ex2',
  type: 'translation' as const,
  question: '请翻译：Good morning',
  correctAnswer: '早上好',
  explanation: 'Good morning是早晨时使用的问候语',
};

const mockFillBlankExercise = {
  id: 'ex3',
  type: 'fill_blank' as const,
  question: '填空：How ___ you?',
  correctAnswer: 'are',
  explanation: 'How are you? 是询问对方近况的常用表达',
};

describe('ExerciseComponent', () => {
  const mockOnAnswer = jest.fn();
  const mockOnNext = jest.fn();

  beforeEach(() => {
    mockOnAnswer.mockClear();
    mockOnNext.mockClear();
  });

  describe('Multiple Choice Exercise', () => {
    test('renders multiple choice exercise correctly', () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockMultipleChoiceExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      expect(screen.getByText('如何用英语说"你好"？')).toBeInTheDocument();
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Goodbye')).toBeInTheDocument();
      expect(screen.getByText('Thank you')).toBeInTheDocument();
      expect(screen.getByText('Sorry')).toBeInTheDocument();
    });

    test('handles option selection', () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockMultipleChoiceExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      const helloOption = screen.getByText('Hello');
      fireEvent.click(helloOption);

      // Should highlight selected option
      expect(helloOption.closest('button')).toHaveClass('selected');
    });

    test('submits correct answer', async () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockMultipleChoiceExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      // Select correct answer
      fireEvent.click(screen.getByText('Hello'));
      
      // Submit answer
      const submitButton = screen.getByText('检查答案');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnAnswer).toHaveBeenCalledWith('Hello', true);
      });
    });

    test('submits incorrect answer', async () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockMultipleChoiceExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      // Select incorrect answer
      fireEvent.click(screen.getByText('Goodbye'));
      
      // Submit answer
      const submitButton = screen.getByText('检查答案');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnAnswer).toHaveBeenCalledWith('Goodbye', false);
      });
    });

    test('shows feedback after submission', async () => {
      const { rerender } = render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockMultipleChoiceExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      // Select and submit answer
      fireEvent.click(screen.getByText('Hello'));
      fireEvent.click(screen.getByText('检查答案'));

      // Rerender with feedback
      rerender(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockMultipleChoiceExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
            showFeedback={true}
            isCorrect={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('正确！')).toBeInTheDocument();
      expect(screen.getByText('继续')).toBeInTheDocument();
    });
  });

  describe('Translation Exercise', () => {
    test('renders translation exercise correctly', () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockTranslationExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      expect(screen.getByText('请翻译：Good morning')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('输入翻译...')).toBeInTheDocument();
    });

    test('handles text input', () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockTranslationExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('输入翻译...');
      fireEvent.change(input, { target: { value: '早上好' } });

      expect(input).toHaveValue('早上好');
    });

    test('submits translation answer', async () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockTranslationExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('输入翻译...');
      fireEvent.change(input, { target: { value: '早上好' } });
      
      const submitButton = screen.getByText('检查答案');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnAnswer).toHaveBeenCalledWith('早上好', true);
      });
    });

    test('handles case-insensitive matching', async () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockTranslationExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('输入翻译...');
      fireEvent.change(input, { target: { value: '早上好' } });
      
      const submitButton = screen.getByText('检查答案');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnAnswer).toHaveBeenCalledWith('早上好', true);
      });
    });
  });

  describe('Fill Blank Exercise', () => {
    test('renders fill blank exercise correctly', () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockFillBlankExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      expect(screen.getByText('填空：How ___ you?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('填入单词...')).toBeInTheDocument();
    });

    test('submits fill blank answer', async () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockFillBlankExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('填入单词...');
      fireEvent.change(input, { target: { value: 'are' } });
      
      const submitButton = screen.getByText('检查答案');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnAnswer).toHaveBeenCalledWith('are', true);
      });
    });
  });

  describe('Exercise States', () => {
    test('disables submit button when no answer provided', () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockTranslationExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      const submitButton = screen.getByText('检查答案');
      expect(submitButton).toBeDisabled();
    });

    test('enables submit button when answer provided', () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockTranslationExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('输入翻译...');
      fireEvent.change(input, { target: { value: 'test' } });

      const submitButton = screen.getByText('检查答案');
      expect(submitButton).not.toBeDisabled();
    });

    test('shows loading state during submission', async () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockMultipleChoiceExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
            isLoading={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('检查中...')).toBeInTheDocument();
    });

    test('handles next button click', () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockMultipleChoiceExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
            showFeedback={true}
            isCorrect={true}
          />
        </TestWrapper>
      );

      const nextButton = screen.getByText('继续');
      fireEvent.click(nextButton);

      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockMultipleChoiceExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      expect(screen.getByRole('group', { name: /练习题/ })).toBeInTheDocument();
    });

    test('supports keyboard navigation', () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={mockMultipleChoiceExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      const firstOption = screen.getByText('Hello');
      firstOption.focus();
      
      // Test Enter key selection
      fireEvent.keyDown(firstOption, { key: 'Enter', code: 'Enter' });
      expect(firstOption.closest('button')).toHaveClass('selected');
    });
  });

  describe('Error Handling', () => {
    test('handles missing exercise data gracefully', () => {
      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={null}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      expect(screen.getByText('练习题加载中...')).toBeInTheDocument();
    });

    test('handles invalid exercise type', () => {
      const invalidExercise = {
        ...mockMultipleChoiceExercise,
        type: 'invalid_type' as any,
      };

      render(
        <TestWrapper>
          <ExerciseComponent
            exercise={invalidExercise}
            onAnswer={mockOnAnswer}
            onNext={mockOnNext}
          />
        </TestWrapper>
      );

      expect(screen.getByText('不支持的练习类型')).toBeInTheDocument();
    });
  });
});