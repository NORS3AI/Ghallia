/**
 * Stats Panel Component
 * Shows player statistics and bonuses
 */

import React, { useState, useEffect } from 'react';
import { useGame } from '../../store/gameStore';
import { formatNumber, formatGold } from '../../utils/math';
import './StatsPanel.css';

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEV_PASSCODE = '9603';

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
  const { state, sellAllResources, devAddGold, devAddMana, devAddMaxMana, devAddBonusTaps, devUnlockSpells, devAddChaosPoints, devSetPrestige } = useGame();
  const [devUnlocked, setDevUnlocked] = useState(() => {
    return localStorage.getItem('ghallia_dev_unlocked') === 'true';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // Save dev unlocked state
  useEffect(() => {
    if (devUnlocked) {
      localStorage.setItem('ghallia_dev_unlocked', 'true');
    }
  }, [devUnlocked]);

  const handlePasscodeSubmit = () => {
    if (passcodeInput === DEV_PASSCODE) {
      setDevUnlocked(true);
      setPasscodeInput('');
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
      setPasscodeInput('');
    }
  };

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
          <div className="header-currencies">
            <span className="currency-gold">💰 {formatGold(state.gold)}g</span>
            {state.spellsUnlocked && (
              <span className="currency-mana">💧 {Math.floor(state.mana)}/{state.maxMana} (+{state.manaRegen.toFixed(1)}/s)</span>
            )}
            {state.prestigeCount > 0 && (
              <span className="currency-chaos">✨ {state.chaosPoints}</span>
            )}
          </div>
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
                <span className="stat-label">Total Play Time</span>
                <span className="stat-value">{formatTime(state.stats.totalPlayTime)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Session Time</span>
                <span className="stat-value">{formatTime(state.stats.sessionPlayTime)}</span>
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

          {/* Developer Tools */}
          <div className="stats-section dev-section">
            <h3>Developer Tools</h3>

            {!devUnlocked ? (
              <div className="dev-locked">
                <p className="dev-locked-text">Enter passcode to unlock developer tools:</p>
                <div className="dev-passcode-row">
                  <input
                    type="password"
                    className={`dev-passcode-input ${passcodeError ? 'error' : ''}`}
                    value={passcodeInput}
                    onChange={(e) => { setPasscodeInput(e.target.value); setPasscodeError(false); }}
                    onKeyDown={(e) => e.key === 'Enter' && handlePasscodeSubmit()}
                    placeholder="••••"
                    maxLength={10}
                  />
                  <button className="dev-button" onClick={handlePasscodeSubmit}>
                    Unlock
                  </button>
                </div>
                {passcodeError && (
                  <p className="dev-passcode-error">Incorrect passcode</p>
                )}
              </div>
            ) : (
              <>
                <div className="dev-row">
                  <span className="dev-label">Add Gold:</span>
                  <div className="dev-buttons">
                    <button className="dev-button" onClick={() => devAddGold(1000)}>+1K</button>
                    <button className="dev-button" onClick={() => devAddGold(10000)}>+10K</button>
                    <button className="dev-button" onClick={() => devAddGold(100000)}>+100K</button>
                  </div>
                </div>

                <div className="dev-row">
                  <span className="dev-label">Add Mana:</span>
                  <div className="dev-buttons">
                    <button className="dev-button" onClick={() => devAddMana(10)}>+10</button>
                    <button className="dev-button" onClick={() => devAddMana(100)}>+100</button>
                    <button className="dev-button" onClick={() => devAddMana(1000)}>+1000</button>
                  </div>
                </div>

                <div className="dev-row">
                  <span className="dev-label">Mana Cap:</span>
                  <div className="dev-buttons">
                    <button className="dev-button" onClick={() => devAddMaxMana(10)}>+10</button>
                    <button className="dev-button" onClick={() => devAddMaxMana(100)}>+100</button>
                    <button className="dev-button" onClick={() => devAddMaxMana(1000)}>+1000</button>
                  </div>
                </div>

                <div className="dev-row">
                  <span className="dev-label">Bonus Taps:</span>
                  <div className="dev-buttons">
                    <button className="dev-button" onClick={() => devAddBonusTaps(5)}>+5</button>
                    <button className="dev-button" onClick={() => devAddBonusTaps(10)}>+10</button>
                    <button className="dev-button" onClick={() => devAddBonusTaps(50)}>+50</button>
                    <button className="dev-button" onClick={() => devAddBonusTaps(100)}>+100</button>
                  </div>
                </div>

                <div className="dev-row">
                  <span className="dev-label">Unlocks:</span>
                  <div className="dev-buttons">
                    <button
                      className={`dev-button ${state.spellsUnlocked ? 'active' : ''}`}
                      onClick={devUnlockSpells}
                      disabled={state.spellsUnlocked}
                    >
                      {state.spellsUnlocked ? '✓ Magic' : 'Unlock Magic'}
                    </button>
                    <button
                      className={`dev-button ${state.prestigeCount > 0 ? 'active' : ''}`}
                      onClick={() => devSetPrestige(Math.max(1, state.prestigeCount))}
                      disabled={state.prestigeCount > 0}
                    >
                      {state.prestigeCount > 0 ? '✓ Prestige' : 'Unlock Prestige'}
                    </button>
                  </div>
                </div>

                <div className="dev-row">
                  <span className="dev-label">Chaos Pts:</span>
                  <div className="dev-buttons">
                    <button className="dev-button" onClick={() => devAddChaosPoints(10)}>+10</button>
                    <button className="dev-button" onClick={() => devAddChaosPoints(100)}>+100</button>
                    <button className="dev-button" onClick={() => devAddChaosPoints(1000)}>+1000</button>
                  </div>
                </div>

                <button
                  className="dev-lock-button"
                  onClick={() => { setDevUnlocked(false); localStorage.removeItem('ghallia_dev_unlocked'); }}
                >
                  Lock Dev Tools
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
