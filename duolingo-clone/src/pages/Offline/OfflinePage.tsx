import React from 'react';
import styled from 'styled-components';
import OfflineManager from '../../components/offline/OfflineManager';

const Container = styled.div`
  min-height: calc(100vh - 70px);
  background: ${props => props.theme.colors.background};
`;

const Header = styled.div`
  background: linear-gradient(135deg, #1cb0f6 0%, #0ea5e9 100%);
  color: white;
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
`;

const OfflinePage: React.FC = () => {
  return (
    <Container>
      <Header>
        <Title>📱 离线学习</Title>
        <Subtitle>
          下载课程内容到本地，随时随地学习，无需网络连接。
          学习进度会在联网后自动同步到云端。
        </Subtitle>
      </Header>
      
      <OfflineManager />
    </Container>
  );
};

export default OfflinePage;