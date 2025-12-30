import React from 'react';
import styled from 'styled-components';
import { Skill } from '../../store/slices/learningSlice';

const NodeContainer = styled.div<{ isAvailable: boolean; level: number }>`
  position: relative;
  cursor: ${props => props.isAvailable ? 'pointer' : 'not-allowed'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: ${props => props.isAvailable ? 'scale(1.05)' : 'none'};
  }
`;

const NodeCircle = styled.div<{ isAvailable: boolean; level: number }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
  border: 4px solid;
  position: relative;
  
  ${props => {
    if (!props.isAvailable) {
      return `
        background: ${props.theme.colors.skillLocked};
        border-color: ${props.theme.colors.border};
        color: ${props.theme.colors.textLight};
      `;
    } else if (props.level === 0) {
      return `
        background: ${props.theme.colors.skillAvailable};
        border-color: ${props.theme.colors.primary};
        color: white;
        box-shadow: 0 4px 0 ${props.theme.colors.primaryDark};
      `;
    } else if (props.level < 5) {
      return `
        background: ${props.theme.colors.skillCompleted};
        border-color: ${props.theme.colors.warning};
        color: white;
        box-shadow: 0 4px 0 #e6b800;
      `;
    } else {
      return `
        background: ${props.theme.colors.skillPerfect};
        border-color: ${props.theme.colors.error};
        color: white;
        box-shadow: 0 4px 0 #cc0000;
      `;
    }
  }}
`;

const NodeIcon = styled.div`
  font-size: 1.8rem;
`;

const NodeTitle = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  text-align: center;
  white-space: nowrap;
`;

const ProgressRing = styled.div<{ level: number }>`
  position: absolute;
  top: -6px;
  left: -6px;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  border: 3px solid transparent;
  
  ${props => props.level > 0 && `
    border-color: ${props.theme.colors.warning};
    background: conic-gradient(
      ${props.theme.colors.warning} ${props.level * 72}deg,
      transparent ${props.level * 72}deg
    );
    -webkit-mask: radial-gradient(circle, transparent 36px, black 36px);
    mask: radial-gradient(circle, transparent 36px, black 36px);
  `}
`;

const LevelBadge = styled.div<{ level: number }>`
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.theme.colors.warning};
  color: white;
  font-size: 0.7rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  
  ${props => !props.level && 'display: none;'}
`;

const LockIcon = styled.div`
  font-size: 1.5rem;
  opacity: 0.6;
`;

interface SkillNodeProps {
  skill: Skill;
  onClick: () => void;
}

const SkillNode: React.FC<SkillNodeProps> = ({ skill, onClick }) => {
  const getSkillIcon = (skillName: string) => {
    const icons: Record<string, string> = {
      'Greetings': '👋',
      'Introductions': '🤝',
      'Family': '👨‍👩‍👧‍👦',
      'Food': '🍎',
      'Colors': '🌈',
      'Numbers': '🔢',
      'Animals': '🐕',
      'Clothes': '👕',
      'Home': '🏠',
      'Travel': '✈️',
    };
    return icons[skillName] || '📚';
  };

  const handleClick = () => {
    if (skill.isAvailable) {
      onClick();
    }
  };

  return (
    <NodeContainer 
      isAvailable={skill.isAvailable} 
      level={skill.level}
      onClick={handleClick}
    >
      <NodeCircle isAvailable={skill.isAvailable} level={skill.level}>
        {skill.level > 0 && <ProgressRing level={skill.level} />}
        
        <NodeIcon>
          {skill.isAvailable ? getSkillIcon(skill.name) : <LockIcon>🔒</LockIcon>}
        </NodeIcon>
        
        {skill.level > 0 && <LevelBadge level={skill.level}>{skill.level}</LevelBadge>}
      </NodeCircle>
      
      <NodeTitle>{skill.name}</NodeTitle>
    </NodeContainer>
  );
};

export default SkillNode;