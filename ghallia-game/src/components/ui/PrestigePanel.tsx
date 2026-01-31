/**
 * Prestige Panel Component
 * Shows prestige requirements, progress, rewards, and talent tree
 */

import React, { useMemo, useState } from 'react';
import {
  useGame,
  SKILL_DEFINITIONS,
  TALENTS,
  TalentDef,
  getTalentCost,
  getRequiredPrestigeForTier,
  calculateChaosPoints,
} from '../../store/gameStore';
import { formatGold } from '../../utils/math';
import './PrestigePanel.css';

interface PrestigePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESTIGE_LEVEL_REQUIREMENT = 99;
const PRESTIGE_SKILLS_REQUIRED = 1;

export function PrestigePanel({ isOpen, onClose }: PrestigePanelProps) {
  const { state, prestige, buyTalent } = useGame();
  const [activeTab, setActiveTab] = useState<'prestige' | 'talents'>('prestige');
  const [confirmPrestige, setConfirmPrestige] = useState(false);

  // Calculate talent bonuses
  const talentBonuses = useMemo(() => {
    let prestigeBonus = 0;
    TALENTS.forEach(talent => {
      const rank = state.talents[talent.id] || 0;
      if (rank > 0 && talent.id === 'prestige_boost') {
        prestigeBonus += talent.effect(rank);
      }
      if (rank > 0 && talent.id === 'ultimate_prestige') {
        prestigeBonus += talent.effect(rank);
      }
    });
    return { prestigeBonus };
  }, [state.talents]);

  // Calculate prestige progress
  const prestigeInfo = useMemo(() => {
    const eligibleSkills = SKILL_DEFINITIONS.filter(
      def => state.skills[def.id].unlocked && state.skills[def.id].level >= PRESTIGE_LEVEL_REQUIREMENT
    );

    // Calculate potential Chaos Points using helper
    const chaosPoints = calculateChaosPoints(state.skills, state.gold, talentBonuses.prestigeBonus);

    // Find highest level skills
    const skillProgress = SKILL_DEFINITIONS
      .filter(def => state.skills[def.id].unlocked)
      .map(def => ({
        name: def.name,
        icon: def.icon,
        level: state.skills[def.id].level,
        isEligible: state.skills[def.id].level >= PRESTIGE_LEVEL_REQUIREMENT,
      }))
      .sort((a, b) => b.level - a.level)
      .slice(0, 5);

    return {
      eligibleCount: eligibleSkills.length,
      requiredCount: PRESTIGE_SKILLS_REQUIRED,
      canPrestige: eligibleSkills.length >= PRESTIGE_SKILLS_REQUIRED,
      chaosPoints,
      skillProgress,
      currentGold: state.gold,
      prestigeCount: state.prestigeCount,
    };
  }, [state, talentBonuses.prestigeBonus]);

  // Group talents by tier
  const talentsByTier = useMemo(() => {
    const tiers: Record<number, TalentDef[]> = {};
    TALENTS.forEach(talent => {
      if (!tiers[talent.tier]) tiers[talent.tier] = [];
      tiers[talent.tier].push(talent);
    });
    return tiers;
  }, []);

  // Handle prestige
  const handlePrestige = () => {
    if (confirmPrestige && prestigeInfo.canPrestige) {
      prestige(prestigeInfo.chaosPoints);
      setConfirmPrestige(false);
      onClose();
    } else {
      setConfirmPrestige(true);
    }
  };

  // Handle talent purchase
  const handleBuyTalent = (talentId: string) => {
    buyTalent(talentId);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`prestige-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`prestige-panel ${isOpen ? 'open' : ''}`}>
        <div className="prestige-header">
          <h2>Prestige</h2>
          <div className="header-currencies">
            <span className="currency-gold">💰 {formatGold(state.gold)}g</span>
            {state.spellsUnlocked && (
              <span className="currency-mana">💧 {Math.floor(state.mana)}/{state.maxMana} (+{state.manaRegen.toFixed(1)}/s)</span>
            )}
            {state.prestigeCount > 0 && (
              <span className="currency-chaos">✨ {state.chaosPoints}</span>
            )}
          </div>
          <button className="prestige-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="prestige-tabs">
          <button
            className={`prestige-tab ${activeTab === 'prestige' ? 'active' : ''}`}
            onClick={() => setActiveTab('prestige')}
          >
            🌀 Prestige
          </button>
          <button
            className={`prestige-tab ${activeTab === 'talents' ? 'active' : ''}`}
            onClick={() => setActiveTab('talents')}
          >
            ✨ Talents
          </button>
        </div>

        <div className="prestige-content">
          {activeTab === 'prestige' && (
            <>
              {/* Current Prestige Level */}
              <div className="prestige-level-section">
                <div className="prestige-level-badge">
                  <span className="prestige-level-number">{prestigeInfo.prestigeCount}</span>
                  <span className="prestige-level-label">Prestige Level</span>
                </div>
              </div>

              {/* Requirements */}
              <div className="prestige-section">
                <h3>Requirements</h3>
                <div className="prestige-requirement">
                  <span className="requirement-icon">
                    {prestigeInfo.canPrestige ? '✅' : '❌'}
                  </span>
                  <span className="requirement-text">
                    {prestigeInfo.eligibleCount} / {prestigeInfo.requiredCount} skills at level {PRESTIGE_LEVEL_REQUIREMENT}+
                  </span>
                </div>
              </div>

              {/* Skill Progress */}
              <div className="prestige-section">
                <h3>Top Skills</h3>
                <div className="skill-progress-list">
                  {prestigeInfo.skillProgress.map((skill, index) => (
                    <div
                      key={index}
                      className={`skill-progress-item ${skill.isEligible ? 'eligible' : ''}`}
                    >
                      <span className="skill-progress-icon">{skill.icon}</span>
                      <span className="skill-progress-name">{skill.name}</span>
                      <span className="skill-progress-level">
                        Lv. {skill.level}
                        {skill.level < PRESTIGE_LEVEL_REQUIREMENT && (
                          <span className="levels-needed">
                            ({PRESTIGE_LEVEL_REQUIREMENT - skill.level} to go)
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewards */}
              <div className="prestige-section">
                <h3>You Will Earn</h3>
                <div className="prestige-reward">
                  <span className="reward-icon">🌀</span>
                  <span className="reward-amount">
                    {prestigeInfo.canPrestige ? prestigeInfo.chaosPoints : '???'}
                  </span>
                  <span className="reward-label">Chaos Points</span>
                </div>
                <p className="reward-hint">
                  Chaos Points unlock permanent upgrades in the Talent tree.
                </p>
              </div>

              {/* What Gets Reset */}
              <div className="prestige-section">
                <h3>What Gets Reset</h3>
                <ul className="reset-list">
                  <li>All skill levels (back to 1)</li>
                  <li>All gold ({formatGold(prestigeInfo.currentGold)}g)</li>
                  <li>All resources and items</li>
                  <li>All mid-tier upgrades</li>
                </ul>
              </div>

              {/* What You Keep */}
              <div className="prestige-section">
                <h3>What You Keep</h3>
                <ul className="keep-list">
                  <li>Chaos Points earned</li>
                  <li>Talent upgrades purchased</li>
                  <li>Support Skills unlocked</li>
                </ul>
              </div>

              {/* Prestige Button */}
              <button
                className={`prestige-button ${prestigeInfo.canPrestige ? 'ready' : 'locked'} ${confirmPrestige ? 'confirm' : ''}`}
                disabled={!prestigeInfo.canPrestige}
                onClick={handlePrestige}
              >
                {confirmPrestige
                  ? `⚠️ Click again to confirm! You will lose everything!`
                  : prestigeInfo.canPrestige
                    ? `Prestige for ${prestigeInfo.chaosPoints} CP`
                    : `Need ${prestigeInfo.requiredCount - prestigeInfo.eligibleCount} more skill${prestigeInfo.requiredCount - prestigeInfo.eligibleCount === 1 ? '' : 's'} at 99+`
                }
              </button>
              {confirmPrestige && (
                <button
                  className="cancel-prestige-button"
                  onClick={() => setConfirmPrestige(false)}
                >
                  Cancel
                </button>
              )}
            </>
          )}

          {activeTab === 'talents' && (
            <>
              {/* Chaos Points Display */}
              <div className="chaos-points-display">
                <span className="chaos-icon">🌀</span>
                <span className="chaos-amount">{state.chaosPoints}</span>
                <span className="chaos-label">Chaos Points</span>
              </div>

              {/* Talent Tiers */}
              {[1, 2, 3, 4, 5].map(tier => {
                const talents = talentsByTier[tier] || [];
                const requiredPrestige = getRequiredPrestigeForTier(tier);
                const isLocked = state.prestigeCount < requiredPrestige;

                return (
                  <div key={tier} className={`talent-tier ${isLocked ? 'locked' : ''}`}>
                    <h3 className="tier-header">
                      Tier {tier}
                      {isLocked && (
                        <span className="tier-requirement">
                          (Requires Prestige {requiredPrestige})
                        </span>
                      )}
                    </h3>
                    <div className="talent-grid">
                      {talents.map(talent => {
                        const currentRank = state.talents[talent.id] || 0;
                        const cost = getTalentCost(talent, currentRank);
                        const canAfford = state.chaosPoints >= cost;
                        const isMaxed = currentRank >= talent.maxRank;
                        const currentEffect = talent.effect(currentRank);

                        return (
                          <div
                            key={talent.id}
                            className={`talent-card ${isLocked ? 'locked' : ''} ${isMaxed ? 'maxed' : ''} ${!canAfford && !isMaxed ? 'cannot-afford' : ''}`}
                          >
                            <div className="talent-icon">{talent.icon}</div>
                            <div className="talent-info">
                              <div className="talent-name">{talent.name}</div>
                              <div className="talent-rank">
                                {currentRank} / {talent.maxRank}
                              </div>
                              <div className="talent-desc">{talent.description}</div>
                              {currentRank > 0 && (
                                <div className="talent-current">
                                  Current: +{currentEffect}%
                                </div>
                              )}
                            </div>
                            {!isLocked && !isMaxed && (
                              <button
                                className="talent-buy-btn"
                                disabled={!canAfford}
                                onClick={() => handleBuyTalent(talent.id)}
                              >
                                {cost} CP
                              </button>
                            )}
                            {isMaxed && (
                              <div className="talent-maxed-badge">MAX</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}
