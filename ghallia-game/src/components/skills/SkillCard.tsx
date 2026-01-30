/**
 * SkillCard Component
 * Displays a single skill in the skill table grid
 */

import { SkillType, SkillCategory } from '../../types/game.types';
import { useGame, SKILL_DEFINITIONS, getXpProgress } from '../../store/gameStore';

interface SkillCardProps {
  skillType: SkillType;
  onClick: () => void;
}

export function SkillCard({ skillType, onClick }: SkillCardProps) {
  const { state } = useGame();
  const skillDef = SKILL_DEFINITIONS.find(s => s.id === skillType)!;
  const skillState = state.skills[skillType];

  const isLocked = !skillState.unlocked;
  const xpProgress = getXpProgress(skillState);

  return (
    <div
      className={`skill-card ${isLocked ? 'locked' : ''}`}
      onClick={isLocked ? undefined : onClick}
    >
      <div className="skill-icon">
        {isLocked ? '🔒' : skillDef.icon}
      </div>
      <div className="skill-info">
        <div className="skill-name">{skillDef.name}</div>
        <div className="skill-level">
          Lv. <span className="skill-level-number">{skillState.level}</span> / 999
        </div>
        {!isLocked && (
          <div className="skill-xp-bar">
            <div className="skill-xp-fill" style={{ width: `${xpProgress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
