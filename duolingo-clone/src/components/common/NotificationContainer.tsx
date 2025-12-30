import React from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../../hooks/redux';
import { useNotification } from '../../hooks/useNotification';

const Container = styled.div`
  position: fixed;
  top: 80px;
  right: 1rem;
  z-index: ${props => props.theme.zIndex.tooltip};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;
`;

const NotificationCard = styled.div<{ 
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
}>`
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: ${props => props.theme.shadows.lg};
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  transform: translateX(${props => props.isVisible ? '0' : '100%'});
  opacity: ${props => props.isVisible ? 1 : 0};
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background: ${props.theme.colors.success};
          color: white;
        `;
      case 'error':
        return `
          background: ${props.theme.colors.error};
          color: white;
        `;
      case 'warning':
        return `
          background: ${props.theme.colors.warning};
          color: white;
        `;
      case 'info':
        return `
          background: ${props.theme.colors.info};
          color: white;
        `;
      default:
        return `
          background: white;
          color: ${props.theme.colors.text};
          border: 1px solid ${props.theme.colors.border};
        `;
    }
  }}
`;

const NotificationIcon = styled.div`
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.div`
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const NotificationMessage = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1.1rem;
  opacity: 0.7;
  padding: 0.25rem;
  border-radius: 0.25rem;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const NotificationContainer: React.FC = () => {
  const { notifications } = useAppSelector(state => state.ui);
  const { hideNotification } = useNotification();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <Container>
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          type={notification.type}
          isVisible={notification.isVisible}
        >
          <NotificationIcon>
            {getIcon(notification.type)}
          </NotificationIcon>
          
          <NotificationContent>
            <NotificationTitle>{notification.title}</NotificationTitle>
            <NotificationMessage>{notification.message}</NotificationMessage>
          </NotificationContent>
          
          <CloseButton onClick={() => hideNotification(notification.id)}>
            ×
          </CloseButton>
        </NotificationCard>
      ))}
    </Container>
  );
};

export default NotificationContainer;