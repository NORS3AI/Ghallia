/**
 * Prestige Panel Component
 * Shows prestige requirements, progress, and rewards
 */

import React, { useMemo } from 'react';
import { useGame, SKILL_DEFINITIONS } from '../../store/gameStore';
import { formatNumber, formatGold } from '../../utils/math';
import './PrestigePanel.css';

interface PrestigePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESTIGE_LEVEL_REQUIREMENT = 99;
const PRESTIGE_SKILLS_REQUIRED = 5;

export function PrestigePanel({ isOpen, onClose }: PrestigePanelProps) {
  const { state } = useGame();

  // Calculate prestige progress
  const prestigeInfo = useMemo(() => {
    const eligibleSkills = SKILL_DEFINITIONS.filter(
      def => state.skills[def.id].unlocked && state.skills[def.id].level >= PRESTIGE_LEVEL_REQUIREMENT
    );

    // Calculate potential Chaos Points
    const skillBonus = eligibleSkills.reduce(
      (sum, def) => sum + Math.floor(state.skills[def.id].level / 10),
      0
    );
    const goldBonus = Math.floor(Math.log10(Math.max(1, state.gold)));
    const extraSkills = Math.max(0, eligibleSkills.length - PRESTIGE_SKILLS_REQUIRED);
    const skillsMultiplier = 1 + extraSkills * 0.2;
    const chaosPoints = Math.floor((100 + skillBonus + goldBonus) * skillsMultiplier);

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
  }, [state]);

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
              <span className="currency-mana">💧 {Math.floor(state.mana)}</span>
            )}
            {state.prestigeCount > 0 && (
              <span className="currency-chaos">✨ {state.chaosPoints}</span>
            )}
          </div>
          <button className="prestige-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="prestige-content">
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
              <li>Achievement progress</li>
            </ul>
          </div>

          {/* Prestige Button */}
          <button
            className={`prestige-button ${prestigeInfo.canPrestige ? 'ready' : 'locked'}`}
            disabled={!prestigeInfo.canPrestige}
          >
            {prestigeInfo.canPrestige
              ? `Prestige for ${prestigeInfo.chaosPoints} CP`
              : `Need ${prestigeInfo.requiredCount - prestigeInfo.eligibleCount} more skills at 99+`
            }
          </button>
        </div>
      </div>
    </>
  );
}
