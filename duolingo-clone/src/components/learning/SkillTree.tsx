import React from 'react';
import styled from 'styled-components';
import { Course } from '../../store/slices/learningSlice';
import SkillNode from './SkillNode';

const TreeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding: 1rem;
`;

const UnitContainer = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const UnitHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const UnitTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const UnitDescription = styled.p`
  color: ${props => props.theme.colors.textLight};
  font-size: 1rem;
`;

const SkillsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
`;

const SkillRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
`;

const ConnectionLine = styled.div`
  width: 2px;
  height: 2rem;
  background: ${props => props.theme.colors.border};
  margin: 0 auto;
`;

interface SkillTreeProps {
  course: Course;
  onSkillClick: (lessonId: string) => void;
}

const SkillTree: React.FC<SkillTreeProps> = ({ course, onSkillClick }) => {
  return (
    <TreeContainer>
      {course.units.map((unit, unitIndex) => (
        <UnitContainer key={unit.id}>
          <UnitHeader>
            <UnitTitle>{unit.name}</UnitTitle>
            <UnitDescription>{unit.description}</UnitDescription>
          </UnitHeader>

          <SkillsGrid>
            {unit.skills.map((skill, skillIndex) => (
              <React.Fragment key={skill.id}>
                <SkillRow>
                  <SkillNode
                    skill={skill}
                    onClick={() => onSkillClick(`lesson-${skill.orderIndex}`)}
                  />
                </SkillRow>
                
                {skillIndex < unit.skills.length - 1 && (
                  <ConnectionLine />
                )}
              </React.Fragment>
            ))}
          </SkillsGrid>
        </UnitContainer>
      ))}
    </TreeContainer>
  );
};

export default SkillTree;