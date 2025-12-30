import React from 'react';
import styled from 'styled-components';

const SettingsContainer = styled.div`
  min-height: calc(100vh - 70px);
  padding: 2rem;
  background: ${props => props.theme.colors.backgroundGray};
`;

const ComingSoon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: ${props => props.theme.colors.textLight};
  font-size: 1.1rem;
  max-width: 500px;
  line-height: 1.6;
`;

const SettingsPage: React.FC = () => {
  return (
    <SettingsContainer>
      <ComingSoon>
        <Icon>⚙️</Icon>
        <Title>Settings Coming Soon!</Title>
        <Description>
          Customize your learning experience with notification settings, 
          sound preferences, privacy controls, and account management options.
        </Description>
      </ComingSoon>
    </SettingsContainer>
  );
};

export default SettingsPage;