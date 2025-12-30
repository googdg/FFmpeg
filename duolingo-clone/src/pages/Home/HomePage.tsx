import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const HomeContainer = styled.div`
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #58cc02 0%, #89e219 100%);
  color: white;
  text-align: center;
`;

const Hero = styled.div`
  max-width: 600px;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled(Link)<{ variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.2s ease;
  min-width: 150px;
  
  ${props => props.variant === 'secondary' ? `
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }
  ` : `
    background: white;
    color: #58cc02;
    box-shadow: 0 4px 0 rgba(0, 0, 0, 0.1);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 0 rgba(0, 0, 0, 0.1);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 0 rgba(0, 0, 0, 0.1);
    }
  `}
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin-top: 3rem;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const FeatureDescription = styled.p`
  opacity: 0.9;
  line-height: 1.5;
`;

const HomePage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <HomeContainer>
      <Hero>
        <Title>Learn English the Fun Way!</Title>
        <Subtitle>
          Master English through bite-sized lessons, games, and stories. 
          Join millions of learners worldwide and make language learning addictive!
        </Subtitle>
        <CTAButtons>
          {isAuthenticated ? (
            <Button to="/learn">Continue Learning</Button>
          ) : (
            <>
              <Button to="/register">Get Started</Button>
              <Button to="/login" variant="secondary">I Already Have an Account</Button>
            </>
          )}
        </CTAButtons>
      </Hero>

      <Features>
        <FeatureCard>
          <FeatureIcon>🎮</FeatureIcon>
          <FeatureTitle>Gamified Learning</FeatureTitle>
          <FeatureDescription>
            Earn XP, maintain streaks, and compete with friends while learning English.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureIcon>🎯</FeatureIcon>
          <FeatureTitle>Bite-sized Lessons</FeatureTitle>
          <FeatureDescription>
            Learn in just 5-10 minutes a day with lessons that fit your schedule.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureIcon>🗣️</FeatureIcon>
          <FeatureTitle>Speaking Practice</FeatureTitle>
          <FeatureDescription>
            Practice pronunciation with our speech recognition technology.
          </FeatureDescription>
        </FeatureCard>
      </Features>
    </HomeContainer>
  );
};

export default HomePage;