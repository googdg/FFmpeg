import React, { useState } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../../hooks/redux';

const LeaderboardContainer = styled.div`
  min-height: calc(100vh - 70px);
  background: linear-gradient(180deg, #ff9500 0%, #ffb347 20%, #ffffff 20%);
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

const PageDescription = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 1rem;
`;

const ContentArea = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const LeagueCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const LeagueHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LeagueTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const LeagueSubtitle = styled.p`
  color: ${props => props.theme.colors.textLight};
  font-size: 0.9rem;
`;

const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LeaderboardItem = styled.div<{ isCurrentUser?: boolean; rank: number }>`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  background: ${props => props.isCurrentUser ? props.theme.colors.primaryLight : 'white'};
  border: 2px solid ${props => {
    if (props.isCurrentUser) return props.theme.colors.primary;
    if (props.rank === 1) return '#FFD700';
    if (props.rank === 2) return '#C0C0C0';
    if (props.rank === 3) return '#CD7F32';
    return props.theme.colors.border;
  }};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const RankBadge = styled.div<{ rank: number }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  margin-right: 1rem;
  background: ${props => {
    if (props.rank === 1) return '#FFD700';
    if (props.rank === 2) return '#C0C0C0';
    if (props.rank === 3) return '#CD7F32';
    return props.theme.colors.backgroundGray;
  }};
  color: ${props => props.rank <= 3 ? 'white' : props.theme.colors.text};
`;

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  margin-right: 1rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 700;
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const UserLevel = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textLight};
`;

const UserXP = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${props => props.theme.colors.primary};
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 0.25rem;

  &:hover {
    background: ${props => props.active ? props.theme.colors.primaryHover : props.theme.colors.hover};
  }
`;

const LeaderboardPage: React.FC = () => {
  const { stats } = useAppSelector(state => state.user);
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'all'>('week');

  const mockLeaderboard = [
    { id: '1', name: '小明', level: 15, xp: 2850, avatar: '🎯', isCurrentUser: false },
    { id: '2', name: '小红', level: 12, xp: 2340, avatar: '🌟', isCurrentUser: false },
    { id: '3', name: '小李', level: 14, xp: 2180, avatar: '🚀', isCurrentUser: false },
    { id: '4', name: '你', level: 8, xp: 1250, avatar: '👤', isCurrentUser: true },
    { id: '5', name: '小王', level: 10, xp: 1180, avatar: '🎨', isCurrentUser: false },
    { id: '6', name: '小张', level: 9, xp: 980, avatar: '🎵', isCurrentUser: false },
    { id: '7', name: '小刘', level: 7, xp: 850, avatar: '🎪', isCurrentUser: false },
    { id: '8', name: '小陈', level: 6, xp: 720, avatar: '🎭', isCurrentUser: false },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank.toString();
  };

  return (
    <LeaderboardContainer>
      <Header>
        <PageTitle>🏆 排行榜</PageTitle>
        <PageDescription>
          与其他学习者竞争，看看谁是本周的英语学习冠军！
        </PageDescription>
      </Header>

      <ContentArea>
        <LeagueCard>
          <LeagueHeader>
            <LeagueTitle>🔥 青铜联赛</LeagueTitle>
            <LeagueSubtitle>本周还剩 3 天 • 前3名晋级银牌联赛</LeagueSubtitle>
          </LeagueHeader>

          <TabContainer>
            <Tab 
              active={activeTab === 'week'} 
              onClick={() => setActiveTab('week')}
            >
              本周
            </Tab>
            <Tab 
              active={activeTab === 'month'} 
              onClick={() => setActiveTab('month')}
            >
              本月
            </Tab>
            <Tab 
              active={activeTab === 'all'} 
              onClick={() => setActiveTab('all')}
            >
              总榜
            </Tab>
          </TabContainer>

          <LeaderboardList>
            {mockLeaderboard.map((user, index) => (
              <LeaderboardItem
                key={user.id}
                isCurrentUser={user.isCurrentUser}
                rank={index + 1}
              >
                <RankBadge rank={index + 1}>
                  {getRankIcon(index + 1)}
                </RankBadge>
                
                <UserAvatar>
                  {user.avatar}
                </UserAvatar>
                
                <UserInfo>
                  <UserName>{user.name}</UserName>
                  <UserLevel>等级 {user.level}</UserLevel>
                </UserInfo>
                
                <UserXP>{user.xp} XP</UserXP>
              </LeaderboardItem>
            ))}
          </LeaderboardList>
        </LeagueCard>

        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <h3 style={{ 
            fontSize: '1.2rem', 
            fontWeight: '700', 
            marginBottom: '0.5rem',
            color: '#333'
          }}>
            继续学习获得更多XP！
          </h3>
          <p style={{ 
            color: '#666', 
            lineHeight: '1.6' 
          }}>
            完成每日课程，保持连击，在排行榜上攀升更高的位置！
          </p>
        </div>
      </ContentArea>
    </LeaderboardContainer>
  );
};

export default LeaderboardPage;