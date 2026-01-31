/**
 * Stats Panel Component
 * Shows player statistics and bonuses
 */

import React from 'react';
import { useGame } from '../../store/gameStore';
import { formatNumber, formatGold } from '../../utils/math';
import './StatsPanel.css';

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function StatsPanel({ isOpen, onClose }: StatsPanelProps) {
  const { state, sellAllResources } = useGame();

  const critRate = state.stats.totalTaps > 0
    ? ((state.stats.totalCrits / state.stats.totalTaps) * 100).toFixed(1)
    : '0.0';

  const luckRate = state.stats.totalTaps > 0
    ? ((state.stats.totalLuckyHits / state.stats.totalTaps) * 100).toFixed(1)
    : '0.0';

  return (
    <>
      <div
        className={`stats-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <div className={`stats-panel ${isOpen ? 'open' : ''}`}>
        <div className="stats-header">
          <h2>Stats</h2>
          <button className="stats-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="stats-content">
          {/* Quick Actions */}
          <div className="stats-section">
            <button className="sell-all-button" onClick={() => { sellAllResources(); }}>
              Sell All Resources
            </button>
          </div>

          {/* Current Bonuses */}
          <div className="stats-section">
            <h3>Current Bonuses</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Taps per Click</span>
                <span className="stat-value">{1 + state.bonusTaps}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Crit Chance</span>
                <span className="stat-value">{state.critChance}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Crit Damage</span>
                <span className="stat-value">{state.critDamage}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Luck</span>
                <span className="stat-value">{state.luck}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Gold Bonus</span>
                <span className="stat-value">+{state.goldBonus}%</span>
              </div>
              {state.spellsUnlocked && (
                <>
                  <div className="stat-item">
                    <span className="stat-label">Max Mana</span>
                    <span className="stat-value mana">{state.maxMana}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Mana Regen</span>
                    <span className="stat-value mana">{state.manaRegen.toFixed(2)}/s</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Lifetime Stats */}
          <div className="stats-section">
            <h3>Lifetime Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Taps</span>
                <span className="stat-value">{formatNumber(state.stats.totalTaps)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Crits</span>
                <span className="stat-value">{formatNumber(state.stats.totalCrits)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Crit Rate</span>
                <span className="stat-value">{critRate}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Lucky Hits</span>
                <span className="stat-value">{formatNumber(state.stats.totalLuckyHits)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Luck Rate</span>
                <span className="stat-value">{luckRate}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Resources Gathered</span>
                <span className="stat-value">{formatNumber(state.stats.totalResourcesGathered)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Gold Earned</span>
                <span className="stat-value gold">{formatGold(state.stats.totalGoldEarned)}g</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Play Time</span>
                <span className="stat-value">{formatTime(state.stats.playTime)}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="stats-section">
            <h3>Progress</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Skills Unlocked</span>
                <span className="stat-value">{state.skillsUnlockedCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Prestige Level</span>
                <span className="stat-value">{state.prestigeCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Chaos Points</span>
                <span className="stat-value">{state.chaosPoints}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Upgrades Bought</span>
                <span className="stat-value">{Object.keys(state.upgrades).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
