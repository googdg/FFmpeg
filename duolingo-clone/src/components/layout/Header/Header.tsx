import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { toggleSidebar } from '../../../store/slices/uiSlice';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: white;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  z-index: ${props => props.theme.zIndex.fixed};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  
  &:hover {
    color: ${props => props.theme.colors.primaryHover};
  }
`;

const LogoIcon = styled.span`
  font-size: 2rem;
  margin-right: 0.5rem;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.primary};
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserStats = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 640px) {
    display: none;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const StatIcon = styled.span`
  font-size: 1.2rem;
`;



const MobileMenuButton = styled.button`
  display: none;
  flex-direction: column;
  gap: 3px;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;

  @media (max-width: 768px) {
    display: flex;
  }

  span {
    width: 20px;
    height: 2px;
    background: ${props => props.theme.colors.text};
    transition: all 0.2s ease;
  }
`;



const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats } = useAppSelector((state) => state.user);

  const handleMobileMenuToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <HeaderContainer>
      <Logo to="/learn">
        <LogoIcon>🦉</LogoIcon>
        多邻国 UG 版
      </Logo>

      <Nav>
        <NavLink to="/learn">学习</NavLink>
        <NavLink to="/stories">故事</NavLink>
        <NavLink to="/leaderboard">排行榜</NavLink>
        <NavLink to="/shop">商店</NavLink>
        <NavLink to="/offline">离线</NavLink>
      </Nav>

      <UserSection>
        <UserStats>
          <StatItem>
            <StatIcon>🔥</StatIcon>
            {stats.currentStreak}
          </StatItem>
          <StatItem>
            <StatIcon>💎</StatIcon>
            {stats.gems}
          </StatItem>
          <StatItem>
            <StatIcon>❤️</StatIcon>
            {stats.hearts}
          </StatItem>
        </UserStats>

        <MobileMenuButton onClick={handleMobileMenuToggle}>
          <span />
          <span />
          <span />
        </MobileMenuButton>
      </UserSection>
    </HeaderContainer>
  );
};

export default Header;