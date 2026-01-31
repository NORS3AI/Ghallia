/**
 * Achievements Panel Component
 * Shows unlocked achievements and allows claiming rewards
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../store/gameStore';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, RARITY_COLORS, AchievementCategory, AchievementRarity, Achievement, getAchievementsByCategory } from '../../data/achievements';
import { formatGold } from '../../utils/math';
import './AchievementsPanel.css';

interface AchievementsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementsPanel({ isOpen, onClose }: AchievementsPanelProps) {
  const { state, unlockAchievement, claimAchievement } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number }[]>([]);
  const [hideClaimed, setHideClaimed] = useState(false);

  // Check for newly unlocked achievements
  useEffect(() => {
    if (!isOpen) return;

    ACHIEVEMENTS.forEach(achievement => {
      if (
        !state.unlockedAchievements.includes(achievement.id) &&
        !state.claimedAchievements.includes(achievement.id) &&
        achievement.check(state)
      ) {
        unlockAchievement(achievement.id);
      }
    });
  }, [isOpen, state, unlockAchievement]);

  const handleClaim = useCallback((achievement: Achievement, event: React.MouseEvent) => {
    if (state.claimedAchievements.includes(achievement.id)) return;

    setClaimingId(achievement.id);

    // Create confetti
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const newConfetti: { id: number; x: number; y: number }[] = [];
    for (let i = 0; i < 20; i++) {
      newConfetti.push({
        id: Date.now() + i,
        x: centerX + (Math.random() - 0.5) * 100,
        y: centerY + (Math.random() - 0.5) * 100,
      });
    }
    setConfetti(newConfetti);

    // Claim after animation starts
    setTimeout(() => {
      claimAchievement(achievement.id, achievement.reward);
      setClaimingId(null);
    }, 300);

    // Clear confetti
    setTimeout(() => {
      setConfetti([]);
    }, 1000);
  }, [state.claimedAchievements, claimAchievement]);

  // Filter achievements - exclude hidden ones first
  const visibleAchievements = ACHIEVEMENTS.filter(a => !a.hidden || !a.hidden(state));
  const filteredAchievements = selectedCategory === 'all'
    ? visibleAchievements
    : visibleAchievements.filter(a => a.category === selectedCategory);

  // Separate into unlocked (claimable), claimed, and locked
  const claimable = filteredAchievements.filter(
    a => state.unlockedAchievements.includes(a.id) && !state.claimedAchievements.includes(a.id)
  );
  const claimed = filteredAchievements.filter(a => state.claimedAchievements.includes(a.id));
  const locked = filteredAchievements.filter(
    a => !state.unlockedAchievements.includes(a.id) && !state.claimedAchievements.includes(a.id)
  );

  // Sort each group by rarity
  const rarityOrder = [
    AchievementRarity.LEGENDARY,
    AchievementRarity.EPIC,
    AchievementRarity.RARE,
    AchievementRarity.UNCOMMON,
    AchievementRarity.COMMON,
  ];

  const sortByRarity = (a: Achievement, b: Achievement) =>
    rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);

  claimable.sort(sortByRarity);
  claimed.sort(sortByRarity);
  locked.sort(sortByRarity);

  // Stats - only count visible achievements
  const totalAchievements = visibleAchievements.length;
  const visibleIds = new Set(visibleAchievements.map(a => a.id));
  const claimedCount = state.claimedAchievements.filter(id => visibleIds.has(id)).length;
  const claimableCount = state.unlockedAchievements.filter(
    id => !state.claimedAchievements.includes(id) && visibleIds.has(id)
  ).length;

  return (
    <>
      <div
        className={`achievements-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <div className={`achievements-panel ${isOpen ? 'open' : ''}`}>
        <div className="achievements-header">
          <h2>Achievements</h2>
          <div className="header-currencies">
            <span className="currency-gold">💰 {formatGold(state.gold)}g</span>
            {state.spellsUnlocked && (
              <span className="currency-mana">💧 {Math.floor(state.mana)}/{state.maxMana} (+{state.manaRegen.toFixed(1)}/s)</span>
            )}
            {state.prestigeCount > 0 && (
              <span className="currency-chaos">✨ {state.chaosPoints}</span>
            )}
          </div>
          <button className="achievements-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Progress stats */}
        <div className="achievements-stats-bar">
          <span className="stat-badge">
            {claimedCount}/{totalAchievements} claimed
          </span>
          {claimableCount > 0 && (
            <span className="claimable-badge">{claimableCount} to claim!</span>
          )}
          <button
            className={`hide-claimed-toggle ${hideClaimed ? 'active' : ''}`}
            onClick={() => setHideClaimed(!hideClaimed)}
          >
            {hideClaimed ? 'Show Claimed' : 'Hide Claimed'}
          </button>
        </div>

        {/* Category Filter */}
        <div className="achievements-filters">
          <button
            className={`filter-button ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            <span className="filter-icon">🏆</span>
            <span className="filter-label">All</span>
          </button>
          {ACHIEVEMENT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`filter-button ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="filter-icon">{cat.icon}</span>
              <span className="filter-label">{cat.name}</span>
            </button>
          ))}
        </div>

        <div className="achievements-content">
          {/* Claimable Achievements */}
          {claimable.length > 0 && (
            <div className="achievements-section">
              <h3 className="section-title claimable">Ready to Claim!</h3>
              <div className="achievements-list">
                {claimable.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`achievement-item claimable ${claimingId === achievement.id ? 'claiming' : ''}`}
                    style={{ '--rarity-color': RARITY_COLORS[achievement.rarity] } as React.CSSProperties}
                  >
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-info">
                      <div className="achievement-name" style={{ color: RARITY_COLORS[achievement.rarity] }}>
                        {achievement.name}
                      </div>
                      <div className="achievement-description">{achievement.description}</div>
                      <div className="achievement-reward">
                        <span className="gold-icon">💰</span>
                        <span className="reward-amount">{formatGold(achievement.reward)}g</span>
                      </div>
                    </div>
                    <button
                      className="claim-button"
                      onClick={(e) => handleClaim(achievement, e)}
                    >
                      Claim
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Claimed Achievements */}
          {claimed.length > 0 && !hideClaimed && (
            <div className="achievements-section">
              <h3 className="section-title claimed">Claimed ({claimed.length})</h3>
              <div className="achievements-list">
                {claimed.map(achievement => (
                  <div
                    key={achievement.id}
                    className="achievement-item claimed"
                    style={{ '--rarity-color': RARITY_COLORS[achievement.rarity] } as React.CSSProperties}
                  >
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-info">
                      <div className="achievement-name" style={{ color: RARITY_COLORS[achievement.rarity] }}>
                        {achievement.name}
                      </div>
                      <div className="achievement-description">{achievement.description}</div>
                    </div>
                    <div className="claimed-badge">✓</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {locked.length > 0 && (
            <div className="achievements-section">
              <h3 className="section-title locked">Locked ({locked.length})</h3>
              <div className="achievements-list">
                {locked.slice(0, 50).map(achievement => (
                  <div
                    key={achievement.id}
                    className="achievement-item locked"
                  >
                    <div className="achievement-icon locked-icon">🔒</div>
                    <div className="achievement-info">
                      <div className="achievement-name locked-name">???</div>
                      <div className="achievement-description locked-desc">{achievement.description}</div>
                    </div>
                  </div>
                ))}
                {locked.length > 50 && (
                  <div className="more-achievements">
                    +{locked.length - 50} more achievements to discover...
                  </div>
                )}
              </div>
            </div>
          )}

          {filteredAchievements.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">🏆</span>
              <p>No achievements in this category yet!</p>
            </div>
          )}
        </div>
      </div>

      {/* Confetti particles */}
      {confetti.map(particle => (
        <div
          key={particle.id}
          className="confetti-particle"
          style={{
            left: particle.x,
            top: particle.y,
            '--hue': Math.random() * 360,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}
