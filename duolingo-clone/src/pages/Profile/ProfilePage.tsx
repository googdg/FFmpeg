import React from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../../hooks/redux';

const ProfileContainer = styled.div`
  min-height: calc(100vh - 70px);
  background: linear-gradient(180deg, #ce82ff 0%, #d4a5ff 20%, #ffffff 20%);
`;

const Header = styled.div`
  padding: 2rem;
  text-align: center;
  color: white;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ContentArea = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  font-weight: 700;
  margin-right: 2rem;
  
  @media (max-width: 640px) {
    margin-right: 0;
    margin-bottom: 1rem;
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const UserLevel = styled.div`
  font-size: 1.1rem;
  color: ${props => props.theme.colors.textLight};
  margin-bottom: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid ${props => props.theme.colors.border};
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textLight};
`;

const AchievementsSection = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 1.5rem;
`;

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

const AchievementBadge = styled.div<{ unlocked: boolean }>`
  background: ${props => props.unlocked ? props.theme.colors.success : props.theme.colors.backgroundGray};
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  opacity: ${props => props.unlocked ? 1 : 0.5};
  transition: all 0.2s ease;

  &:hover {
    transform: ${props => props.unlocked ? 'scale(1.05)' : 'none'};
  }
`;

const BadgeIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const BadgeName = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
`;

const ProgressSection = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ProgressChart = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
`;

const DayBlock = styled.div<{ hasActivity: boolean; isToday: boolean }>`
  aspect-ratio: 1;
  border-radius: 0.25rem;
  background: ${props => {
    if (props.isToday) return props.theme.colors.primary;
    if (props.hasActivity) return props.theme.colors.success;
    return props.theme.colors.backgroundGray;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: ${props => props.hasActivity || props.isToday ? 'white' : props.theme.colors.textLight};
  font-weight: 600;
`;

const ProfilePage: React.FC = () => {
  const { stats } = useAppSelector(state => state.user);

  const mockAchievements = [
    { id: '1', name: '首次课程', icon: '🎯', unlocked: true },
    { id: '2', name: '连击达人', icon: '🔥', unlocked: true },
    { id: '3', name: '学习新手', icon: '📚', unlocked: true },
    { id: '4', name: '词汇大师', icon: '📝', unlocked: false },
    { id: '5', name: '完美主义', icon: '⭐', unlocked: false },
    { id: '6', name: '坚持不懈', icon: '💪', unlocked: false },
  ];

  // 生成最近7天的学习活动
  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const isToday = i === 6;
    const hasActivity = Math.random() > 0.3; // 70%概率有学习活动
    
    return {
      date: date.getDate(),
      hasActivity,
      isToday,
    };
  });

  return (
    <ProfileContainer>
      <Header>
        <PageTitle>👤 个人资料</PageTitle>
      </Header>

      <ContentArea>
        <ProfileCard>
          <ProfileHeader>
            <Avatar>👤</Avatar>
            <UserInfo>
              <UserName>英语学习者</UserName>
              <UserLevel>等级 {Math.floor(stats.totalXP / 100) + 1} • {stats.totalXP} XP</UserLevel>
            </UserInfo>
          </ProfileHeader>

          <StatsGrid>
            <StatCard>
              <StatIcon>🔥</StatIcon>
              <StatValue>{stats.currentStreak}</StatValue>
              <StatLabel>当前连击</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon>💎</StatIcon>
              <StatValue>{stats.gems}</StatValue>
              <StatLabel>宝石</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon>❤️</StatIcon>
              <StatValue>{stats.hearts}</StatValue>
              <StatLabel>生命值</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon>📚</StatIcon>
              <StatValue>{stats.lessonsCompleted}</StatValue>
              <StatLabel>完成课程</StatLabel>
            </StatCard>
          </StatsGrid>
        </ProfileCard>

        <AchievementsSection>
          <SectionTitle>🏆 成就徽章</SectionTitle>
          <AchievementsGrid>
            {mockAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                unlocked={achievement.unlocked}
              >
                <BadgeIcon>{achievement.icon}</BadgeIcon>
                <BadgeName>{achievement.name}</BadgeName>
              </AchievementBadge>
            ))}
          </AchievementsGrid>
        </AchievementsSection>

        <ProgressSection>
          <SectionTitle>📅 学习活动</SectionTitle>
          <p style={{ 
            color: '#666', 
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            最近7天的学习记录
          </p>
          <ProgressChart>
            {recentDays.map((day, index) => (
              <DayBlock
                key={index}
                hasActivity={day.hasActivity}
                isToday={day.isToday}
              >
                {day.date}
              </DayBlock>
            ))}
          </ProgressChart>
        </ProgressSection>
      </ContentArea>
    </ProfileContainer>
  );
};

export default ProfilePage;