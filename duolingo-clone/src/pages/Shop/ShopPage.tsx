import React from 'react';
import styled from 'styled-components';

const ShopContainer = styled.div`
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

const ShopPage: React.FC = () => {
  return (
    <ShopContainer>
      <ComingSoon>
        <Icon>🛒</Icon>
        <Title>Shop Coming Soon!</Title>
        <Description>
          Use your gems to buy power-ups, outfits for your owl, 
          streak freezes, and other helpful items to enhance your learning experience!
        </Description>
      </ComingSoon>
    </ShopContainer>
  );
};

export default ShopPage;