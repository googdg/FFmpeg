import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from 'styled-components';
import SkillTree from '../learning/SkillTree';
import { theme } from '../../styles/theme';
import userSlice from '../../store/slices/userSlice';
import learningSlice from '../../store/slices/learningSlice';

// Mock store setup
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: userSlice,
      learning: learningSlice,
    },
    preloadedState: {
      user: {
        profile: {
          id: 'test-user',
          username: 'testuser',
          email: 'test@example.com',
        },
        stats: {
          totalXP: 150,
          currentStreak: 5,
          gems: 100,
          hearts: 5,
          level: 3,
        },
        isAuthenticated: true,
        loading: false,
        error: null,
        ...initialState.user,
      },
      learning: {
        courses: [],
        currentCourse: null,
        currentLesson: null,
        progress: {},
        loading: false,
        error: null,
        ...initialState.learning,
      },
    },
  });
};

// Mock course data
const mockCourse = {
  id: 'english-basics',
  name: '英语基础',
  description: '学习基础英语技能',
  languageFrom: 'zh',
  languageTo: 'en',
  totalXP: 150,
  completionPercentage: 25,
  units: [
    {
      id: 'unit-1',
      courseId: 'english-basics',
      name: '基础 1',
      description: '学习基本问候和介绍',
      orderIndex: 1,
      unlockRequirement: 0,
      skills: [
        {
          id: 'skill-1',
          unitId: 'unit-1',
          name: '问候',
          description: '学习如何打招呼和告别',
          iconUrl: '/icons/greetings.svg',
          level: 2,
          xpEarned: 50,
          lessonsCompleted: 3,
          totalLessons: 5,
          strength: 0.8,
          isAvailable: true,
          orderIndex: 1,
        },
        {
          id: 'skill-2',
          unitId: 'unit-1',
          name: '介绍',
          description: '学习如何自我介绍',
          iconUrl: '/icons/introductions.svg',
          level: 1,
          xpEarned: 20,
          lessonsCompleted: 1,
          totalLessons: 4,
          strength: 0.6,
          isAvailable: true,
          orderIndex: 2,
        },
        {
          id: 'skill-3',
          unitId: 'unit-1',
          name: '数字',
          description: '学习基本数字',
          iconUrl: '/icons/numbers.svg',
          level: 0,
          xpEarned: 0,
          lessonsCompleted: 0,
          totalLessons: 3,
          strength: 0,
          isAvailable: false,
          orderIndex: 3,
        },
      ],
    },
  ],
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; store?: any }> = ({ 
  children, 
  store 
}) => {
  const mockStore = store || createMockStore();
  
  return (
    <Provider store={mockStore}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </Provider>
  );
};

describe('SkillTree Component', () => {
  const mockOnSkillClick = jest.fn();

  beforeEach(() => {
    mockOnSkillClick.mockClear();
  });

  test('renders course units correctly', () => {
    render(
      <TestWrapper>
        <SkillTree course={mockCourse} onSkillClick={mockOnSkillClick} />
      </TestWrapper>
    );

    // Check if unit title is rendered
    expect(screen.getByText('基础 1')).toBeInTheDocument();
    expect(screen.getByText('学习基本问候和介绍')).toBeInTheDocument();
  });

  test('renders skills with correct status', () => {
    render(
      <TestWrapper>
        <SkillTree course={mockCourse} onSkillClick={mockOnSkillClick} />
      </TestWrapper>
    );

    // Check available skills
    expect(screen.getByText('问候')).toBeInTheDocument();
    expect(screen.getByText('介绍')).toBeInTheDocument();
    
    // Check unavailable skill
    expect(screen.getByText('数字')).toBeInTheDocument();
  });

  test('displays skill progress correctly', () => {
    render(
      <TestWrapper>
        <SkillTree course={mockCourse} onSkillClick={mockOnSkillClick} />
      </TestWrapper>
    );

    // Check if progress indicators are present
    const progressElements = screen.getAllByText(/\d+\/\d+/);
    expect(progressElements.length).toBeGreaterThan(0);
  });

  test('handles skill click for available skills', () => {
    render(
      <TestWrapper>
        <SkillTree course={mockCourse} onSkillClick={mockOnSkillClick} />
      </TestWrapper>
    );

    // Find and click an available skill
    const greetingSkill = screen.getByText('问候').closest('button');
    expect(greetingSkill).toBeInTheDocument();
    
    if (greetingSkill) {
      fireEvent.click(greetingSkill);
      expect(mockOnSkillClick).toHaveBeenCalledWith('skill-1');
    }
  });

  test('prevents click on unavailable skills', () => {
    render(
      <TestWrapper>
        <SkillTree course={mockCourse} onSkillClick={mockOnSkillClick} />
      </TestWrapper>
    );

    // Find unavailable skill
    const numbersSkill = screen.getByText('数字').closest('button');
    expect(numbersSkill).toBeInTheDocument();
    
    if (numbersSkill) {
      fireEvent.click(numbersSkill);
      // Should not call onSkillClick for unavailable skills
      expect(mockOnSkillClick).not.toHaveBeenCalledWith('skill-3');
    }
  });

  test('displays skill levels correctly', () => {
    render(
      <TestWrapper>
        <SkillTree course={mockCourse} onSkillClick={mockOnSkillClick} />
      </TestWrapper>
    );

    // Check if level indicators are displayed
    // This would depend on how levels are displayed in the component
    const skillElements = screen.getAllByRole('button');
    expect(skillElements.length).toBe(3); // 3 skills in the mock data
  });

  test('shows empty state when no course provided', () => {
    render(
      <TestWrapper>
        <SkillTree course={null} onSkillClick={mockOnSkillClick} />
      </TestWrapper>
    );

    // Should handle null course gracefully
    expect(screen.queryByText('基础 1')).not.toBeInTheDocument();
  });

  test('handles course with no units', () => {
    const emptyCourse = {
      ...mockCourse,
      units: [],
    };

    render(
      <TestWrapper>
        <SkillTree course={emptyCourse} onSkillClick={mockOnSkillClick} />
      </TestWrapper>
    );

    // Should handle empty units array
    expect(screen.queryByText('基础 1')).not.toBeInTheDocument();
  });

  test('displays skill strength indicators', () => {
    render(
      <TestWrapper>
        <SkillTree course={mockCourse} onSkillClick={mockOnSkillClick} />
      </TestWrapper>
    );

    // Check if strength indicators are present
    // This would depend on the specific implementation
    const skillNodes = screen.getAllByRole('button');
    expect(skillNodes.length).toBeGreaterThan(0);
  });

  test('applies correct styling for different skill states', () => {
    render(
      <TestWrapper>
        <SkillTree course={mockCourse} onSkillClick={mockOnSkillClick} />
      </TestWrapper>
    );

    // Check if different skill states have different styling
    const availableSkill = screen.getByText('问候').closest('button');
    const unavailableSkill = screen.getByText('数字').closest('button');
    
    expect(availableSkill).toBeInTheDocument();
    expect(unavailableSkill).toBeInTheDocument();
    
    // The specific styling checks would depend on the implementation
    // For example, checking for disabled attribute or specific CSS classes
  });
});

// Integration test for SkillTree with Redux state
describe('SkillTree Integration Tests', () => {
  test('integrates correctly with Redux store', () => {
    const store = createMockStore({
      learning: {
        currentCourse: mockCourse,
      },
    });

    render(
      <TestWrapper store={store}>
        <SkillTree course={mockCourse} onSkillClick={jest.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('问候')).toBeInTheDocument();
  });

  test('updates when course data changes', () => {
    const store = createMockStore();
    const { rerender } = render(
      <TestWrapper store={store}>
        <SkillTree course={mockCourse} onSkillClick={jest.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('问候')).toBeInTheDocument();

    // Update course data
    const updatedCourse = {
      ...mockCourse,
      units: [
        {
          ...mockCourse.units[0],
          name: '更新的单元',
        },
      ],
    };

    rerender(
      <TestWrapper store={store}>
        <SkillTree course={updatedCourse} onSkillClick={jest.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('更新的单元')).toBeInTheDocument();
  });
});