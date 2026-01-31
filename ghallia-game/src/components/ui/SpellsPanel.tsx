/**
 * Spells Panel Component
 * Unlockable panel for magical spells that consume mana
 */

import React, { useMemo } from 'react';
import { useGame, SPELLS, SpellDef } from '../../store/gameStore';
import { formatGold } from '../../utils/math';
import './SpellsPanel.css';

interface SpellsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpellsPanel({ isOpen, onClose }: SpellsPanelProps) {
  const { state, unlockSpells, castSpell } = useGame();

  const canUnlock = state.gold >= 1000 && !state.spellsUnlocked;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`spells-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`spells-panel ${isOpen ? 'open' : ''}`}>
        <div className="spells-header">
          <h2>Spells</h2>
          <div className="header-currencies">
            <span className="currency-gold">💰 {formatGold(state.gold)}g</span>
            {state.spellsUnlocked && (
              <span className="currency-mana">💧 {Math.floor(state.mana)}/{state.maxMana}</span>
            )}
            {state.prestigeCount > 0 && (
              <span className="currency-chaos">✨ {state.chaosPoints}</span>
            )}
          </div>
          <button className="spells-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="spells-content">
          {!state.spellsUnlocked ? (
            <div className="spells-unlock-section">
              <div className="unlock-icon">✨</div>
              <h3>Unlock Magic</h3>
              <p className="unlock-description">
                Unlock the arcane arts to harness powerful spells.
                Gain mana that regenerates over time and cast spells for powerful temporary effects.
              </p>
              <div className="unlock-features">
                <div className="unlock-feature">
                  <span className="feature-icon">💧</span>
                  <span>Start with 50 max mana</span>
                </div>
                <div className="unlock-feature">
                  <span className="feature-icon">⏱️</span>
                  <span>Regenerate 0.1 mana/sec</span>
                </div>
                <div className="unlock-feature">
                  <span className="feature-icon">⚡</span>
                  <span>Access 5 powerful spells</span>
                </div>
              </div>
              <button
                className={`unlock-button ${canUnlock ? 'affordable' : ''}`}
                onClick={unlockSpells}
                disabled={!canUnlock}
              >
                {canUnlock
                  ? 'Unlock for 1,000g'
                  : `Need ${formatGold(1000 - state.gold)}g more`
                }
              </button>
            </div>
          ) : (
            <div className="spells-list">
              {SPELLS.map(spell => (
                <SpellItem
                  key={spell.id}
                  spell={spell}
                  spellState={state.spells[spell.id]}
                  mana={state.mana}
                  onCast={() => castSpell(spell.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface SpellItemProps {
  spell: SpellDef;
  spellState?: { activeUntil: number; cooldownUntil: number };
  mana: number;
  onCast: () => void;
}

function SpellItem({ spell, spellState, mana, onCast }: SpellItemProps) {
  const now = Date.now();
  const isActive = spellState && spellState.activeUntil > now;
  const isOnCooldown = spellState && spellState.cooldownUntil > now && !isActive;
  const canCast = mana >= spell.manaCost && !isActive && !isOnCooldown;

  const timeRemaining = useMemo(() => {
    if (isActive && spellState) {
      return Math.ceil((spellState.activeUntil - now) / 1000);
    }
    if (isOnCooldown && spellState) {
      return Math.ceil((spellState.cooldownUntil - now) / 1000);
    }
    return 0;
  }, [isActive, isOnCooldown, spellState, now]);

  // Force re-render every second for countdown
  const [, forceUpdate] = React.useState(0);
  React.useEffect(() => {
    if (isActive || isOnCooldown) {
      const interval = setInterval(() => forceUpdate(v => v + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isActive, isOnCooldown]);

  return (
    <div className={`spell-item ${isActive ? 'active' : ''} ${isOnCooldown ? 'cooldown' : ''}`}>
      <div className="spell-icon">{spell.icon}</div>
      <div className="spell-info">
        <div className="spell-name">{spell.name}</div>
        <div className="spell-description">{spell.description}</div>
        <div className="spell-stats">
          <span className="spell-mana">💧 {spell.manaCost}</span>
          <span className="spell-duration">⏱️ {spell.duration}s</span>
        </div>
      </div>
      <div className="spell-action">
        {isActive ? (
          <div className="spell-active-badge">
            <span className="active-time">{timeRemaining}s</span>
            <span className="active-label">Active</span>
          </div>
        ) : isOnCooldown ? (
          <div className="spell-cooldown-badge">
            <span className="cooldown-time">{timeRemaining}s</span>
            <span className="cooldown-label">Cooldown</span>
          </div>
        ) : (
          <button
            className={`spell-cast ${canCast ? 'ready' : ''}`}
            onClick={onCast}
            disabled={!canCast}
          >
            Cast
          </button>
        )}
      </div>
    </div>
  );
}
