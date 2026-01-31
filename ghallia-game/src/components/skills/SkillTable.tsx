/**
 * SkillTable Component
 * Main home view showing all skills in a grid
 */

import { SkillType, SkillCategory } from '../../types/game.types';
import { useGame, SKILL_DEFINITIONS } from '../../store/gameStore';
import { SkillCard } from './SkillCard';

interface SkillTableProps {
  onSelectSkill: (skillType: SkillType) => void;
}

export function SkillTable({ onSelectSkill }: SkillTableProps) {
  const { state } = useGame();

  const gatheringSkills = SKILL_DEFINITIONS.filter(s => s.category === SkillCategory.GATHERING);
  const craftingSkills = SKILL_DEFINITIONS.filter(s => s.category === SkillCategory.CRAFTING);
  const supportSkills = SKILL_DEFINITIONS.filter(s => s.category === SkillCategory.SUPPORT);

  const unlockedGathering = gatheringSkills.filter(s => state.skills[s.id].unlocked).length;
  const unlockedCrafting = craftingSkills.filter(s => state.skills[s.id].unlocked).length;
  const unlockedSupport = supportSkills.filter(s => state.skills[s.id].unlocked).length;

  // Only show support skills after prestige 1
  const showSupport = state.prestigeCount >= 1;

  return (
    <div className="skill-table">
      {/* Gathering Skills */}
      <div className="skill-category">
        <div className="skill-category-header">
          <span className="skill-category-title">⚔️ Gathering</span>
          <span className="skill-category-badge">{unlockedGathering}/{gatheringSkills.length}</span>
        </div>
        <div className="skill-grid">
          {gatheringSkills.map(skill => (
            <SkillCard
              key={skill.id}
              skillType={skill.id}
              onClick={() => onSelectSkill(skill.id)}
            />
          ))}
        </div>
      </div>

      {/* Crafting Skills */}
      <div className="skill-category">
        <div className="skill-category-header">
          <span className="skill-category-title">🔨 Crafting</span>
          <span className="skill-category-badge">{unlockedCrafting}/{craftingSkills.length}</span>
        </div>
        <div className="skill-grid">
          {craftingSkills.map(skill => (
            <SkillCard
              key={skill.id}
              skillType={skill.id}
              onClick={() => onSelectSkill(skill.id)}
            />
          ))}
        </div>
      </div>

      {/* Magic Skills - Only after Prestige 1 */}
      {showSupport && (
        <div className="skill-category">
          <div className="skill-category-header">
            <span className="skill-category-title">🔮 Magic</span>
            <span className="skill-category-badge">{unlockedSupport}/{supportSkills.length}</span>
          </div>
          <div className="skill-grid">
            {supportSkills.map(skill => (
              <SkillCard
                key={skill.id}
                skillType={skill.id}
                onClick={() => onSelectSkill(skill.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
