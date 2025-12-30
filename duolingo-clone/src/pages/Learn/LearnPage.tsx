import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { useNotification } from '../../hooks/useNotification';
import { setCourse } from '../../store/slices/learningSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SkillTree from '../../components/learning/SkillTree';
import LessonModal from '../../components/learning/LessonModal';
import { offlineService } from '../../services/offlineService';

const LearnContainer = styled.div`
  min-height: calc(100vh - 70px);
  background: linear-gradient(180deg, #58cc02 0%, #89e219 20%, #ffffff 20%);
`;

const Header = styled.div`
  padding: 2rem;
  text-align: center;
  color: white;
`;

const CourseTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CourseDescription = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div`
  background: rgba(255, 255, 255, 0.3);
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  max-width: 400px;
  margin: 0 auto;
`;

const ProgressFill = styled.div<{ progress: number }>`
  background: white;
  height: 100%;
  width: ${props => props.progress}%;
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  margin-top: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const OfflineBanner = styled.div`
  background: rgba(255, 193, 7, 0.9);
  color: #856404;
  padding: 8px 16px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1rem;
  border-radius: 8px;
  
  .icon {
    margin-right: 8px;
  }
`;

const ContentArea = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const WelcomeCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const WelcomeTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const WelcomeText = styled.p`
  color: ${props => props.theme.colors.textLight};
  line-height: 1.6;
  margin-bottom: 1.5rem;
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

const LearnPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showError, showSuccess } = useNotification();
  const { currentCourse } = useAppSelector(state => state.learning);
  
  const [loading, setLoading] = useState(true);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [courseLoaded, setCourseLoaded] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineCourse, setOfflineCourse] = useState<any>(null);

  useEffect(() => {
    if (!courseLoaded) {
      loadCourse();
    }
    
    // 监听网络状态变化
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [courseLoaded]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      
      let courseData = null;
      const courseId = 'english-basics';
      
      // 如果离线，尝试加载离线课程
      if (isOffline) {
        try {
          courseData = await offlineService.getOfflineCourse(courseId);
          if (courseData) {
            setOfflineCourse(courseData);
            showSuccess('离线模式', '正在使用离线课程数据');
          } else {
            showError('离线错误', '没有找到离线课程数据，请先在线下载课程');
            return;
          }
        } catch (error) {
          console.error('加载离线课程失败:', error);
        }
      }
      
      // 如果没有离线数据或在线模式，使用模拟数据
      if (!courseData) {
        courseData = {
          id: 'english-basics',
          name: '英语基础',
          description: '学习基础英语技能',
          languageFrom: 'zh',
          languageTo: 'en',
          totalXP: 0,
          completionPercentage: 0,
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
                  level: 1,
                  xpEarned: 50,
                  lessonsCompleted: 0,
                  totalLessons: 5,
                  strength: 1.0,
                  isAvailable: true,
                  orderIndex: 1,
                },
                {
                  id: 'skill-2',
                  unitId: 'unit-1',
                  name: '介绍',
                  description: '学习如何自我介绍',
                  iconUrl: '/icons/introductions.svg',
                  level: 0,
                  xpEarned: 0,
                  lessonsCompleted: 0,
                  totalLessons: 4,
                  strength: 0.0,
                  isAvailable: false,
                  orderIndex: 2,
                },
              ],
            },
          ],
        };
      }
      
      dispatch(setCourse(courseData));
      setCourseLoaded(true);
      
      if (!isOffline) {
        showSuccess('课程加载成功', '准备开始学习！');
      }
    } catch (error) {
      showError('加载错误', '课程加载失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    setSelectedLesson(lessonId);
    setShowLessonModal(true);
  };

  const handleCloseLessonModal = () => {
    setShowLessonModal(false);
    setSelectedLesson(null);
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="正在加载课程..." />;
  }

  if (!currentCourse) {
    return (
      <LearnContainer>
        <ContentArea>
          <WelcomeCard>
            <WelcomeTitle>欢迎来到英语学习！</WelcomeTitle>
            <WelcomeText>
              准备好开启你的英语学习之旅吧！我们为你设计了趣味十足、互动性强的课程。
            </WelcomeText>
            <StartButton onClick={loadCourse}>
              开始学习英语
            </StartButton>
          </WelcomeCard>
        </ContentArea>
      </LearnContainer>
    );
  }

  return (
    <LearnContainer>
      <Header>
        <CourseTitle>{currentCourse.name}</CourseTitle>
        <CourseDescription>{currentCourse.description}</CourseDescription>
        <ProgressBar>
          <ProgressFill progress={currentCourse.completionPercentage || 0} />
        </ProgressBar>
        <ProgressText>
          {Math.round(currentCourse.completionPercentage || 0)}% 完成
        </ProgressText>
      </Header>

      <ContentArea>
        {isOffline && (
          <OfflineBanner>
            <span className="icon">📱</span>
            离线模式 - 学习进度会在联网后自动同步
          </OfflineBanner>
        )}
        
        {!currentCourse.totalXP && (
          <WelcomeCard>
            <WelcomeTitle>👋 欢迎来到英语学习！</WelcomeTitle>
            <WelcomeText>
              你即将开始学习英语！每节课都会教你新的单词和短语。完成练习来获得经验值并解锁新技能。
            </WelcomeText>
          </WelcomeCard>
        )}

        <SkillTree 
          course={currentCourse}
          onSkillClick={handleStartLesson}
        />
      </ContentArea>

      {showLessonModal && selectedLesson && (
        <LessonModal
          lessonId={selectedLesson}
          onClose={handleCloseLessonModal}
        />
      )}
    </LearnContainer>
  );
};

export default LearnPage;