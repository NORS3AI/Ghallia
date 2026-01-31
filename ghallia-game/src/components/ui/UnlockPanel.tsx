/**
 * UnlockPanel Component
 * Slide-up panel for unlocking new skills
 */

import { SkillType, SkillCategory } from '../../types/game.types';
import { useGame, SKILL_DEFINITIONS, getUnlockCost, SUPPORT_SKILL_COSTS, isSupportSkill } from '../../store/gameStore';
import { formatNumber } from '../../utils/math';

interface UnlockPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UnlockPanel({ isOpen, onClose }: UnlockPanelProps) {
  const { state, unlockSkill } = useGame();

  const nextUnlockCost = getUnlockCost(state.skillsUnlockedCount + 1);
  const canAffordGold = state.gold >= nextUnlockCost;

  // Get locked regular skills
  const lockedRegularSkills = SKILL_DEFINITIONS.filter(skill => {
    if (skill.category === SkillCategory.SUPPORT) return false;
    return !state.skills[skill.id].unlocked;
  });

  // Get locked support skills (only show after Prestige 1)
  const lockedSupportSkills = state.prestigeCount >= 1
    ? SKILL_DEFINITIONS.filter(skill => {
        if (skill.category !== SkillCategory.SUPPORT) return false;
        return !state.skills[skill.id].unlocked;
      })
    : [];

  // Special case: Sawmill must be unlocked second
  const isSawmillNext = state.skillsUnlockedCount === 1;

  const handleUnlock = (skillType: SkillType) => {
    unlockSkill(skillType);
  };

  const canAffordSkill = (skillType: SkillType): boolean => {
    if (isSupportSkill(skillType)) {
      const cpCost = SUPPORT_SKILL_COSTS[skillType] || 100;
      return state.chaosPoints >= cpCost;
    }
    return canAffordGold;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`unlock-panel-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`unlock-panel ${isOpen ? 'open' : ''}`}>
        <div className="unlock-panel-handle" />
        <h3 className="unlock-panel-title">Unlock New Skill</h3>

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Cost: </span>
          <span style={{
            color: canAffordGold ? 'var(--color-gold-light)' : 'var(--color-accent-red)',
            fontWeight: 600
          }}>
            {formatNumber(nextUnlockCost)}g
          </span>
          <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px' }}>
            (You have: {formatNumber(state.gold)}g)
          </span>
        </div>

        <div className="unlock-skill-list">
          {isSawmillNext ? (
            // Force Sawmill as second unlock
            <div className="unlock-skill-item">
              <div className="skill-icon">🪚</div>
              <div className="unlock-skill-info">
                <div className="unlock-skill-name">Sawmill</div>
                <div className="unlock-skill-desc">Process wood into lumber (Required)</div>
              </div>
              <button
                className="unlock-button"
                onClick={() => handleUnlock(SkillType.SAWMILL)}
                disabled={!canAffordGold}
              >
                {canAffordGold ? 'Unlock' : 'Need gold'}
              </button>
            </div>
          ) : (
            <>
              {/* Regular Skills */}
              {lockedRegularSkills.map(skill => (
                <div key={skill.id} className="unlock-skill-item">
                  <div className="skill-icon">{skill.icon}</div>
                  <div className="unlock-skill-info">
                    <div className="unlock-skill-name">{skill.name}</div>
                    <div className="unlock-skill-desc">{skill.description}</div>
                  </div>
                  <button
                    className="unlock-button"
                    onClick={() => handleUnlock(skill.id)}
                    disabled={!canAffordGold}
                  >
                    {canAffordGold ? 'Unlock' : 'Need gold'}
                  </button>
                </div>
              ))}

              {/* Support Skills Section (after Prestige 1) */}
              {lockedSupportSkills.length > 0 && (
                <>
                  <div className="support-skills-divider">
                    <span>✨ Support Skills (Chaos Points)</span>
                  </div>
                  {lockedSupportSkills.map(skill => {
                    const cpCost = SUPPORT_SKILL_COSTS[skill.id] || 100;
                    const canAffordCP = state.chaosPoints >= cpCost;
                    return (
                      <div key={skill.id} className="unlock-skill-item support-skill">
                        <div className="skill-icon">{skill.icon}</div>
                        <div className="unlock-skill-info">
                          <div className="unlock-skill-name">{skill.name}</div>
                          <div className="unlock-skill-desc">{skill.description}</div>
                          <div className="unlock-skill-cost">
                            <span className="cp-cost">🌀 {cpCost} CP</span>
                          </div>
                        </div>
                        <button
                          className="unlock-button cp-unlock"
                          onClick={() => handleUnlock(skill.id)}
                          disabled={!canAffordCP}
                        >
                          {canAffordCP ? 'Unlock' : 'Need CP'}
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}

          {lockedRegularSkills.length === 0 && lockedSupportSkills.length === 0 && !isSawmillNext && (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px' }}>
              All available skills unlocked!
              {state.prestigeCount < 1 && (
                <div style={{ marginTop: '8px' }}>
                  Prestige to unlock Support Skills
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
